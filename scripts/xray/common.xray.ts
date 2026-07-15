import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

const PROJECT_ROOT = process.cwd();
const DEFAULT_ENV = (process.env.ENV ?? 'qa').toLowerCase();
const ENV_FILE = path.join(PROJECT_ROOT, `.env.${DEFAULT_ENV}`);

if (fs.existsSync(ENV_FILE)) {
  dotenv.config({ path: ENV_FILE });
} else {
  dotenv.config();
}

export { PROJECT_ROOT };
export const XRAY_CLOUD_BASE = 'https://xray.cloud.getxray.app';

export type CliOptions = {
  testPlan?: string;
  environment?: string;
  epic?: string;
  execution?: string;
  resultsFile: string;
  evidenceDir: string;
  dryRun: boolean;
};

export type ScenarioResult = {
  jiraKey: string;
  scenarioName: string;
  status: 'PASSED' | 'FAILED';
  durationMs: number;
  startedOn?: string;
  errors: string[];
};

export type AggregatedResult = {
  jiraKey: string;
  overallStatus: 'PASSED' | 'FAILED';
  totalDurationMs: number;
  earliestStart?: string;
  scenarios: ScenarioResult[];
  errors: string[];
};

type CucumberTag = { name?: string };
type CucumberStepResult = { status?: string; duration?: number; error_message?: string };
type CucumberStep = { result?: CucumberStepResult };
type CucumberScenario = {
  id?: string;
  name?: string;
  description?: string;
  keyword?: string;
  tags?: CucumberTag[];
  steps?: CucumberStep[];
  start_timestamp?: string;
};
type CucumberFeature = {
  name?: string;
  tags?: CucumberTag[];
  elements?: CucumberScenario[];
};

let xrayToken: string | null = null;

function ensureEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function parseArgs(requiredFields: Array<keyof CliOptions>): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    resultsFile: path.join(PROJECT_ROOT, 'reports', 'cucumber', 'cucumber-report.json'),
    evidenceDir: path.join(PROJECT_ROOT, 'reports', 'errors'),
    dryRun: false,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    switch (arg) {
      case '--test-plan':
        options.testPlan = args[i + 1];
        i += 1;
        break;
      case '--environment':
        options.environment = args[i + 1];
        i += 1;
        break;
      case '--epic':
        options.epic = args[i + 1];
        i += 1;
        break;
      case '--execution':
        options.execution = args[i + 1];
        i += 1;
        break;
      case '--results':
        options.resultsFile = path.resolve(args[i + 1]);
        i += 1;
        break;
      case '--evidence-dir':
        options.evidenceDir = path.resolve(args[i + 1]);
        i += 1;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      default:
        break;
    }
  }

  for (const field of requiredFields) {
    const value = options[field];
    if (!value) {
      const flag = `--${String(field).replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`;
      throw new Error(`${flag} is required`);
    }
  }

  return options;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestJson(
  url: string,
  init: RequestInit,
  retries = 3,
): Promise<{ status: number; ok: boolean; text: string; json: unknown }> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, init);
      const text = await response.text();
      let json: unknown = text;
      try {
        json = JSON.parse(text);
      } catch {
        // Keep raw text for non-JSON responses.
      }
      return { status: response.status, ok: response.ok, text, json };
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await sleep(attempt * 1500);
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('HTTP request failed');
}

export async function jiraFetch(endpoint: string, init: RequestInit = {}): Promise<unknown> {
  const jiraBaseUrl = ensureEnv('JIRA_BASE_URL');
  const jiraEmail = ensureEnv('JIRA_EMAIL');
  const jiraApiToken = ensureEnv('JIRA_API_TOKEN');

  const authHeader = `Basic ${Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString('base64')}`;
  const url = `${jiraBaseUrl.replace(/\/$/, '')}/rest/api/3${endpoint}`;

  const response = await requestJson(url, {
    method: init.method ?? 'GET',
    headers: {
      Authorization: authHeader,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    body: init.body,
  });

  if (!response.ok) {
    throw new Error(`Jira API ${response.status}: ${response.text}`);
  }

  return response.json;
}

export async function xrayAuthenticate(): Promise<string> {
  const clientId = ensureEnv('XRAY_CLIENT_ID');
  const clientSecret = ensureEnv('XRAY_CLIENT_SECRET');

  const response = await requestJson(`${XRAY_CLOUD_BASE}/api/v2/authenticate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret }),
  });

  if (!response.ok) {
    throw new Error(`Xray auth failed (${response.status}): ${response.text}`);
  }

  const rawToken = response.text.trim();
  xrayToken = rawToken.replace(/^"|"$/g, '');
  return xrayToken;
}

export async function xrayGraphQL<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  if (!xrayToken) {
    throw new Error('Xray token not initialized. Call xrayAuthenticate() first.');
  }

  const response = await requestJson(`${XRAY_CLOUD_BASE}/api/v2/graphql`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${xrayToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Xray GraphQL ${response.status}: ${response.text}`);
  }

  const payload = response.json as { data?: T; errors?: Array<{ message?: string }> };
  if (payload.errors && payload.errors.length > 0) {
    const msg = payload.errors.map((e) => e.message ?? 'Unknown GraphQL error').join('; ');
    throw new Error(`Xray GraphQL error: ${msg}`);
  }

  if (!payload.data) {
    throw new Error('Xray GraphQL returned no data');
  }

  return payload.data;
}

function extractJiraKeys(text: string): string[] {
  const matches = text.match(/\b[A-Z][A-Z0-9]+-\d+\b/g) ?? [];
  return Array.from(new Set(matches));
}

function normalizeScenarioStatus(steps: CucumberStep[]): 'PASSED' | 'FAILED' {
  let hasFailure = false;

  for (const step of steps) {
    const status = (step.result?.status ?? '').toLowerCase();
    if (status === 'failed' || status === 'ambiguous' || status === 'undefined') {
      hasFailure = true;
      break;
    }
  }

  return hasFailure ? 'FAILED' : 'PASSED';
}

function scenarioDurationMs(steps: CucumberStep[]): number {
  let durationNs = 0;
  for (const step of steps) {
    durationNs += step.result?.duration ?? 0;
  }
  return durationNs / 1_000_000;
}

function scenarioErrors(steps: CucumberStep[]): string[] {
  const errors: string[] = [];
  for (const step of steps) {
    const message = step.result?.error_message;
    if (message) {
      errors.push(message);
    }
  }
  return errors;
}

export function readCucumberResults(resultsFile: string): ScenarioResult[] {
  if (!fs.existsSync(resultsFile)) {
    throw new Error(`Results file not found: ${resultsFile}`);
  }

  const raw = fs.readFileSync(resultsFile, 'utf-8');
  const features = JSON.parse(raw) as CucumberFeature[];
  const scenarios: ScenarioResult[] = [];

  for (const feature of features) {
    const featureTags = (feature.tags ?? []).map((t) => t.name ?? '').join(' ');
    const featureText = `${feature.name ?? ''} ${featureTags}`;

    for (const element of feature.elements ?? []) {
      const steps = element.steps ?? [];
      const elementTags = (element.tags ?? []).map((t) => t.name ?? '').join(' ');
      const searchText = `${featureText} ${element.name ?? ''} ${element.description ?? ''} ${element.id ?? ''} ${elementTags}`;
      const jiraKeys = extractJiraKeys(searchText);

      if (jiraKeys.length === 0) {
        continue;
      }

      const status = normalizeScenarioStatus(steps);
      const durationMs = scenarioDurationMs(steps);
      const errors = scenarioErrors(steps);

      for (const jiraKey of jiraKeys) {
        scenarios.push({
          jiraKey,
          scenarioName: element.name ?? 'Unnamed Scenario',
          status,
          durationMs,
          startedOn: element.start_timestamp,
          errors,
        });
      }
    }
  }

  return scenarios;
}

export function aggregateByJiraKey(results: ScenarioResult[]): AggregatedResult[] {
  const map = new Map<string, AggregatedResult>();

  for (const item of results) {
    if (!map.has(item.jiraKey)) {
      map.set(item.jiraKey, {
        jiraKey: item.jiraKey,
        overallStatus: 'PASSED',
        totalDurationMs: 0,
        earliestStart: item.startedOn,
        scenarios: [],
        errors: [],
      });
    }

    const current = map.get(item.jiraKey);
    if (!current) {
      continue;
    }

    current.scenarios.push(item);
    current.totalDurationMs += item.durationMs;

    if (item.status === 'FAILED') {
      current.overallStatus = 'FAILED';
      current.errors.push(...item.errors);
    }

    if (item.startedOn && (!current.earliestStart || item.startedOn < current.earliestStart)) {
      current.earliestStart = item.startedOn;
    }
  }

  return Array.from(map.values());
}

export function contextFilePath(): string {
  const dir = path.join(PROJECT_ROOT, 'reports', 'xray');
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, 'execution-context.json');
}

export function saveContext(data: unknown): void {
  fs.writeFileSync(contextFilePath(), JSON.stringify(data, null, 2));
}

export function loadContext<T>(): T | null {
  const filePath = contextFilePath();
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}
