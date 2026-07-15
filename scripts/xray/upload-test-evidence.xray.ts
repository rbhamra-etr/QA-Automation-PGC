import fs from 'node:fs';
import path from 'node:path';
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
  };
};

type ContextData = {
  testPlan?: string;
  execution?: string;
  executionIssueId?: string;
};

type EvidencePayload = {
  filename: string;
  mimeType: string;
  data: string;
};

const SUPPORTED_EXTENSIONS = new Set([
  '.txt',
  '.json',
  '.log',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.mp4',
]);

function mimeTypeFor(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.json') {
    return 'application/json';
  }
  if (ext === '.log' || ext === '.txt') {
    return 'text/plain';
  }
  if (ext === '.png') {
    return 'image/png';
  }
  if (ext === '.jpg' || ext === '.jpeg') {
    return 'image/jpeg';
  }
  if (ext === '.webp') {
    return 'image/webp';
  }
  if (ext === '.mp4') {
    return 'video/mp4';
  }
  return 'application/octet-stream';
}

function listEvidenceFiles(rootDir: string): string[] {
  if (!fs.existsSync(rootDir)) {
    return [];
  }

  const files: string[] = [];
  const stack = [rootDir];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) {
      continue;
    }

    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (SUPPORTED_EXTENSIONS.has(ext)) {
          files.push(fullPath);
        }
      }
    }
  }

  return files;
}

function containsJiraKey(filePath: string, jiraKey: string): boolean {
  const base = path.basename(filePath).toUpperCase();
  if (base.includes(jiraKey.toUpperCase())) {
    return true;
  }

  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.json' || ext === '.txt' || ext === '.log') {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return content.toUpperCase().includes(jiraKey.toUpperCase());
    } catch {
      return false;
    }
  }

  return false;
}

function buildEvidencePayload(filePath: string): EvidencePayload {
  const data = fs.readFileSync(filePath);
  return {
    filename: path.basename(filePath),
    mimeType: mimeTypeFor(filePath),
    data: data.toString('base64'),
  };
}

async function main(): Promise<void> {
  const opts = parseArgs([]);
  const context = loadContext<ContextData>();

  const testPlan = opts.testPlan ?? context?.testPlan;
  const execution = opts.execution ?? context?.execution;

  if (!testPlan) {
    throw new Error('Missing test plan. Pass --test-plan or run xray:create-execution first.');
  }
  if (!execution) {
    throw new Error('Missing execution key. Pass --execution or run xray:create-execution first.');
  }

  const allEvidenceFiles = listEvidenceFiles(opts.evidenceDir);
  if (allEvidenceFiles.length === 0) {
    console.log(`No evidence files found in ${opts.evidenceDir}. Skipping upload.`);
    return;
  }

  console.log(`Uploading evidence for ${execution} from ${opts.evidenceDir}`);
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
    console.log('No matched Jira tests from cucumber-report.json. Skipping evidence upload.');
    return;
  }

  if (opts.dryRun) {
    for (const item of matched) {
      const selected = allEvidenceFiles.filter((filePath) =>
        containsJiraKey(filePath, item.jiraKey),
      );
      console.log(` - ${item.jiraKey}: ${selected.length} evidence file(s)`);
    }
    return;
  }

  let uploadedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const item of matched) {
    const xrayIssueId = planTestMap.get(item.jiraKey)?.issueId;
    if (!xrayIssueId) {
      continue;
    }

    const selectedFiles = allEvidenceFiles.filter((filePath) =>
      containsJiraKey(filePath, item.jiraKey),
    );
    if (selectedFiles.length === 0) {
      skippedCount += 1;
      continue;
    }

    process.stdout.write(
      `Uploading evidence for ${item.jiraKey} (${selectedFiles.length} file(s)) ... `,
    );

    try {
      const runData = await xrayGraphQL<GetTestRunResponse>(`{
        getTestRun(testIssueId: "${xrayIssueId}", testExecIssueId: "${execIssueId}") {
          id
        }
      }`);

      const runId = runData.getTestRun?.id;
      if (!runId) {
        console.log('skipped (test run not found)');
        failedCount += 1;
        continue;
      }

      const evidencePayload = selectedFiles.map((filePath) => buildEvidencePayload(filePath));

      await xrayGraphQL(
        `
        mutation AddEvidenceToRun($id: String!, $evidence: [AttachmentDataInput]!) {
          addEvidenceToTestRun(id: $id, evidence: $evidence) {
            addedEvidence
            warnings
          }
        }
      `,
        { id: runId, evidence: evidencePayload },
      );

      uploadedCount += evidencePayload.length;
      console.log('done');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`error (${message.substring(0, 140)})`);
      failedCount += 1;
    }
  }

  console.log(`Evidence files uploaded: ${uploadedCount}`);
  console.log(`Tests without matching evidence: ${skippedCount}`);
  if (failedCount > 0) {
    console.log(`Tests with upload errors: ${failedCount}`);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Fatal: ${message}`);
  process.exit(1);
});
