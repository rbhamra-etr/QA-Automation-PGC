import type { APIResponse } from '@playwright/test';

export interface ApiResult {
  /** The raw Playwright response. */
  response: APIResponse;
  /** Parsed JSON body, or raw text if the body is not valid JSON. */
  body: any;
  /** HTTP status code, surfaced for convenience. */
  status: number;
}

export interface RequestOptions {
  /** Query string parameters. */
  params?: Record<string, string | number | boolean>;
  /** Request headers. */
  headers?: Record<string, string>;
  /** JSON request body (for POST/PUT/PATCH). */
  data?: unknown;
  /** Max retries on HTTP 429. Default 4. */
  maxRetries?: number;
  /** Initial backoff delay in ms (doubles each retry). Default 500. */
  initialDelayMs?: number;
}
