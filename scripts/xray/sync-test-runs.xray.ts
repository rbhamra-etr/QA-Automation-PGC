import {
  aggregateByJiraKey,
  jiraFetch,
  loadContext,
  parseArgs,
  readCucumberResults,
  xrayAuthenticate,
  xrayGraphQL,
} from './common.xray';

type PlanTest = { issueId?: string; jira?: { key?: string; summary?: string } };
type XrayPlanResponse = {
  getTestPlans?: {
    results?: Array<{
      tests?: { results?: PlanTest[] };
    }>;
  };
};

type ResolveExecutionResponse = {
  getTestExecutions?: {
    results?: Array<{ issueId?: string }>;
  };
};

type GetTestRunResponse = {
  getTestRun?: {
    id?: string;
    status?: { name?: string };
  };
};

type ContextData = {
  testPlan?: string;
  execution?: string;
  executionIssueId?: string;
  environment?: string;
};

async function main(): Promise<void> {
  const opts = parseArgs([]);
  const context = loadContext<ContextData>();

  const testPlan = opts.testPlan ?? context?.testPlan;
  const execution = opts.execution ?? context?.execution;
  const environment = opts.environment ?? context?.environment ?? 'N/A';

  if (!testPlan) {
    throw new Error('Missing test plan. Pass --test-plan or run xray:create-execution first.');
  }
  if (!execution) {
    throw new Error('Missing execution key. Pass --execution or run xray:create-execution first.');
  }

  console.log(`Importing results into ${execution} (plan ${testPlan})`);
  if (opts.dryRun) {
    console.log('Dry run enabled');
  }

  await jiraFetch('/myself');
  await xrayAuthenticate();

  const planData = await xrayGraphQL<XrayPlanResponse>(`{
    getTestPlans(jql: "key = ${testPlan}", limit: 1) {
      results {
        tests(limit: 500) {
          results {
            issueId
            jira(fields: ["key", "summary"])
          }
        }
      }
    }
  }`);

  const planTests = planData.getTestPlans?.results?.[0]?.tests?.results ?? [];
  const planTestMap = new Map<string, { issueId: string; summary: string }>();
  for (const testItem of planTests) {
    const key = testItem.jira?.key;
    const issueId = testItem.issueId;
    if (key && issueId) {
      planTestMap.set(key, { issueId, summary: testItem.jira?.summary ?? '' });
    }
  }

  let execIssueId = context?.executionIssueId;
  if (!execIssueId) {
    const executionData = await xrayGraphQL<ResolveExecutionResponse>(`{
      getTestExecutions(jql: "key = ${execution}", limit: 1) {
        results {
          issueId
        }
      }
    }`);

    execIssueId = executionData.getTestExecutions?.results?.[0]?.issueId;
    if (!execIssueId) {
      throw new Error(`Execution ${execution} not found`);
    }
  }

  const scenarioResults = readCucumberResults(opts.resultsFile);
  const aggregated = aggregateByJiraKey(scenarioResults);
  const matched = aggregated.filter((a) => planTestMap.has(a.jiraKey));

  if (matched.length === 0) {
    throw new Error(
      'No Jira test keys from cucumber-report.json match tests in the Test Plan. Add Jira keys (for example QA-123) to scenario names or tags.',
    );
  }

  if (opts.dryRun) {
    console.log('Would update these test runs:');
    for (const item of matched) {
      console.log(` - ${item.jiraKey}: ${item.overallStatus}`);
    }
    return;
  }

  let updated = 0;
  let failed = 0;

  for (const item of matched) {
    const xrayIssueId = planTestMap.get(item.jiraKey)?.issueId;
    if (!xrayIssueId) {
      continue;
    }

    process.stdout.write(`Updating ${item.jiraKey} -> ${item.overallStatus} ... `);

    try {
      const runData = await xrayGraphQL<GetTestRunResponse>(`{
        getTestRun(testIssueId: "${xrayIssueId}", testExecIssueId: "${execIssueId}") {
          id
          status { name }
        }
      }`);

      const runId = runData.getTestRun?.id;
      if (!runId) {
        console.log('skipped (test run not found)');
        failed += 1;
        continue;
      }

      await xrayGraphQL(
        `
        mutation UpdateRunStatus($id: String!, $status: String!) {
          updateTestRunStatus(id: $id, status: $status)
        }
      `,
        { id: runId, status: item.overallStatus },
      );

      const scenarioDetails = item.scenarios
        .map((s) => `- ${s.scenarioName}: ${s.status} (${(s.durationMs / 1000).toFixed(1)}s)`)
        .join('\n');

      const failureDetails =
        item.errors.length > 0
          ? `\n\nFailure details:\n${item.errors.map((e) => e.substring(0, 900)).join('\n---\n')}`
          : '';

      const comment = [
        'Automated Cucumber execution',
        `Environment: ${environment}`,
        `Total Duration: ${(item.totalDurationMs / 1000).toFixed(1)}s`,
        `Executed: ${new Date().toISOString()}`,
        '',
        'Scenario Results:',
        scenarioDetails,
        failureDetails,
      ].join('\n');

      await xrayGraphQL(
        `
        mutation UpdateRunComment($id: String!, $comment: String!) {
          updateTestRunComment(id: $id, comment: $comment)
        }
      `,
        { id: runId, comment },
      );

      if (item.earliestStart) {
        const startedOn = item.earliestStart;
        const finishedOn = new Date(
          new Date(startedOn).getTime() + item.totalDurationMs,
        ).toISOString();

        try {
          await xrayGraphQL(
            `
            mutation UpdateRunTiming($id: String!, $startedOn: String, $finishedOn: String) {
              updateTestRun(id: $id, startedOn: $startedOn, finishedOn: $finishedOn) {
                warnings
              }
            }
          `,
            { id: runId, startedOn, finishedOn },
          );
        } catch {
          // Timing update is non-critical.
        }
      }

      updated += 1;
      console.log('done');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`error (${message.substring(0, 140)})`);
      failed += 1;
    }
  }

  console.log(`Updated test runs: ${updated}`);
  if (failed > 0) {
    console.log(`Runs with errors: ${failed}`);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Fatal: ${message}`);
  process.exit(1);
});
