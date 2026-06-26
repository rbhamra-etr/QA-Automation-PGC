import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from '../../core/fixtures/test.fixture';
import { BaseApi } from '../../core/shared/base.api';
import { getApiService, resolveApiBaseUrl } from '../../core/configs/app-registry.config';
import { apiContext, requireLastResult } from './context.api';

const { Given, When, Then } = createBdd(test);

/**
 * Generic, registry-driven API steps usable by ANY company API. Service-specific
 * steps (e.g. toll rate validation) live alongside each service in src/api/<svc>.
 *
 * To enable these for a new API, add it to API_SERVICES in app-registry.ts.
 */

// Tracks the base URL of the service selected by the most recent availability step.
let currentBaseUrl: string | undefined;

// ── Availability ─────────────────────────────────────────────────────────────
// Example: Given the "Toll" API is available
Given('the {string} API is available', async ({}, serviceKey: string) => {
  const service = getApiService(serviceKey);
  currentBaseUrl = resolveApiBaseUrl(service);
  expect(currentBaseUrl, `${service.label} base URL must be configured`).toBeTruthy();
});

// ── Requests ─────────────────────────────────────────────────────────────────
// Example: When I send a GET request to "/rates" with query parameters:
//   | entry | 1  |
//   | exit  | 5  |
When(
  'I send a GET request to {string} with query parameters:',
  async ({ request, $testInfo }, path: string, table: { rawTable: string[][] }) => {
    const baseUrl = ensureBaseUrl();
    const params = tableToParams(table);
    const api = new BaseApi(request, baseUrl, $testInfo);
    apiContext.last = await api.get(path, { params });
  },
);

// Example: When I send a GET request to "/health"
When('I send a GET request to {string}', async ({ request, $testInfo }, path: string) => {
  const baseUrl = ensureBaseUrl();
  const api = new BaseApi(request, baseUrl, $testInfo);
  apiContext.last = await api.get(path);
});

// Example: When I send a POST request to "/orders" with body:
//   """
//   { "id": 1 }
//   """
When(
  'I send a POST request to {string} with body:',
  async ({ request, $testInfo }, path: string, body: string) => {
    const baseUrl = ensureBaseUrl();
    const api = new BaseApi(request, baseUrl, $testInfo);
    apiContext.last = await api.post(path, { data: safeJson(body) });
  },
);

// ── Assertions ───────────────────────────────────────────────────────────────
// Example: Then the response status should be 200
Then('the response status should be {int}', async ({}, expectedStatus: number) => {
  const result = requireLastResult();
  expect(result.status, `Expected status ${expectedStatus}`).toBe(expectedStatus);
});

// Example: Then the response body field "etr_toll" should equal "12.34"
Then(
  'the response body field {string} should equal {string}',
  async ({}, fieldPath: string, expected: string) => {
    const result = requireLastResult();
    const actual = readPath(result.body, fieldPath);
    expect(String(actual), `Field '${fieldPath}'`).toBe(expected);
  },
);

// Example: Then the response body should contain "success"
Then('the response body should contain {string}', async ({}, substring: string) => {
  const result = requireLastResult();
  const text = typeof result.body === 'string' ? result.body : JSON.stringify(result.body);
  expect(text).toContain(substring);
});

// ── Helpers ──────────────────────────────────────────────────────────────────
function ensureBaseUrl(): string {
  if (!currentBaseUrl) {
    throw new Error(
      'No API selected. Add a step like `Given the "Toll" API is available` before sending a request.',
    );
  }
  return currentBaseUrl;
}

/** Convert a two-column Gherkin data table into a params object. */
function tableToParams(table: { rawTable: string[][] }): Record<string, string> {
  const params: Record<string, string> = {};
  for (const row of table.rawTable) {
    if (row.length >= 2) params[row[0].trim()] = row[1].trim();
  }
  return params;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** Read a dotted path (e.g. "zone_info.0.rate") from a parsed body. */
function readPath(obj: any, path: string): unknown {
  return path
    .split('.')
    .reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}
