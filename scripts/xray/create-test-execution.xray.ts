import {
  aggregateByJiraKey,
  jiraFetch,
  parseArgs,
  readCucumberResults,
  saveContext,
  xrayAuthenticate,
  xrayGraphQL,
} from './common.xray';

type PlanTest = { issueId?: string; jira?: { key?: string; summary?: string } };
type XrayPlanResponse = {
  getTestPlans?: {
    results?: Array<{
      issueId?: string;
      jira?: { summary?: string; key?: string };
      tests?: { results?: PlanTest[] };
    }>;
  };
};

type CreateExecutionResponse = {
  createTestExecution?: {
    testExecution?: {
      issueId?: string;
      jira?: { key?: string; summary?: string };
    };
    warnings?: string[];
  };
};

type ResolveExecutionResponse = {
  getTestExecutions?: {
    results?: Array<{ issueId?: string; jira?: { key?: string; summary?: string } }>;
  };
};

type ContextData = {
  testPlan: string;
  testPlanIssueId: string;
  execution: string;
  executionIssueId: string;
  environment: string;
  epic?: string;
  createdNewExecution: boolean;
  createdAt: string;
};

async function main(): Promise<void> {
  const opts = parseArgs(['testPlan', 'environment']);
  const projectKey = process.env.JIRA_PROJECT_KEY ?? 'QA';

  console.log(`Creating Xray execution for plan ${opts.testPlan} (${opts.environment})`);
  if (opts.dryRun) {
    console.log('Dry run enabled');
  }

  await jiraFetch('/myself');
  await xrayAuthenticate();

  const planData = await xrayGraphQL<XrayPlanResponse>(`{
    getTestPlans(jql: "key = ${opts.testPlan}", limit: 1) {
      results {
        issueId
        jira(fields: ["summary", "key"])
        tests(limit: 500) {
          results {
            issueId
            jira(fields: ["key", "summary"])
          }
        }
      }
    }
  }`);

  const plan = planData.getTestPlans?.results?.[0];
  if (!plan?.issueId) {
    throw new Error(`Test Plan ${opts.testPlan} not found in Xray`);
  }

  const planTests = plan.tests?.results ?? [];
  const planTestMap = new Map<string, { issueId: string; summary: string }>();
  for (const item of planTests) {
    const key = item.jira?.key;
    const issueId = item.issueId;
    if (key && issueId) {
      planTestMap.set(key, { issueId, summary: item.jira?.summary ?? '' });
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
    console.log(`Would include ${matched.length} test keys in execution`);
    for (const item of matched) {
      console.log(` - ${item.jiraKey}: ${item.overallStatus}`);
    }
    return;
  }

  let executionKey: string;
  let executionIssueId: string;
  let createdNewExecution = false;

  if (opts.execution) {
    const existing = await xrayGraphQL<ResolveExecutionResponse>(`{
      getTestExecutions(jql: "key = ${opts.execution}", limit: 1) {
        results {
          issueId
          jira(fields: ["key", "summary"])
        }
      }
    }`);

    const resolved = existing.getTestExecutions?.results?.[0];
    if (!resolved?.issueId || !resolved.jira?.key) {
      throw new Error(`Execution ${opts.execution} not found`);
    }

    executionKey = resolved.jira.key;
    executionIssueId = resolved.issueId;
  } else {
    const summary = `[Automated] ${opts.environment} - ${new Date().toISOString()}`;
    const testIssueIds = matched
      .map((m) => planTestMap.get(m.jiraKey)?.issueId)
      .filter((v): v is string => Boolean(v));

    const jiraFields: Record<string, unknown> = {
      summary,
      project: { key: projectKey },
      issuetype: { name: 'Xray Test Execution' },
    };

    if (opts.epic) {
      jiraFields.parent = { key: opts.epic };
    }

    const created = await xrayGraphQL<CreateExecutionResponse>(
      `
      mutation CreateExecution($testIssueIds: [String], $testEnvironments: [String], $jira: JSON!) {
        createTestExecution(testIssueIds: $testIssueIds, testEnvironments: $testEnvironments, jira: $jira) {
          testExecution {
            issueId
            jira(fields: ["key", "summary"])
          }
          warnings
        }
      }
    `,
      {
        testIssueIds,
        testEnvironments: [opts.environment],
        jira: { fields: jiraFields },
      },
    );

    const execution = created.createTestExecution?.testExecution;
    if (!execution?.issueId || !execution.jira?.key) {
      throw new Error('Failed to create Test Execution');
    }

    executionKey = execution.jira.key;
    executionIssueId = execution.issueId;
    createdNewExecution = true;

    const warnings = created.createTestExecution?.warnings ?? [];
    for (const warning of warnings) {
      console.log(`Xray warning: ${warning}`);
    }

    await xrayGraphQL(
      `
      mutation LinkExecutionToPlan($issueId: String!, $testExecIssueIds: [String]!) {
        addTestExecutionsToTestPlan(issueId: $issueId, testExecIssueIds: $testExecIssueIds) {
          addedTestExecutions
          warning
        }
      }
    `,
      {
        issueId: plan.issueId,
        testExecIssueIds: [executionIssueId],
      },
    );
  }

  const context: ContextData = {
    testPlan: opts.testPlan ?? '',
    testPlanIssueId: plan.issueId,
    execution: executionKey,
    executionIssueId,
    environment: opts.environment ?? '',
    epic: opts.epic,
    createdNewExecution,
    createdAt: new Date().toISOString(),
  };

  saveContext(context);
  console.log(`Execution ready: ${executionKey}`);
  console.log('Saved context: reports/xray/execution-context.json');
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Fatal: ${message}`);
  process.exit(1);
});
