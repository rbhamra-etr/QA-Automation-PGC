import { APIRequestContext, APIResponse, TestInfo } from '@playwright/test';
import type { ApiResult, RequestOptions } from '../models/base-api.model';

export type { ApiResult, RequestOptions } from '../models/base-api.model';

/**
 * base-api.ts — a generic, service-agnostic HTTP helper for API testing.
 *
 * This is framework infrastructure: it knows nothing about Toll, Billing, or any
 * specific company API. Any API module reuses it to get:
 *   • GET/POST/PUT/DELETE helpers
 *   • automatic retry on HTTP 429 (rate limiting) with exponential backoff
 *   • request/response attachments in the Playwright HTML report
 *   • safe JSON parsing (falls back to raw text)
 *
 * Service-specific modules (e.g. src/api/toll) wrap this with their own base URL
 * and business assertions.
 */

export class BaseApi {
  /**
   * @param request  Playwright's APIRequestContext (from the `request` fixture).
   * @param baseUrl  This service's base URL (resolved from env via the registry).
   * @param testInfo Optional — when provided, requests/responses are attached to the report.
   */
  constructor(
    protected readonly request: APIRequestContext,
    protected readonly baseUrl: string,
    protected readonly testInfo?: TestInfo,
  ) {}

  async get(path = '', options: RequestOptions = {}): Promise<ApiResult> {
    return this.send('GET', path, options);
  }

  async post(path = '', options: RequestOptions = {}): Promise<ApiResult> {
    return this.send('POST', path, options);
  }

  async put(path = '', options: RequestOptions = {}): Promise<ApiResult> {
    return this.send('PUT', path, options);
  }

  async delete(path = '', options: RequestOptions = {}): Promise<ApiResult> {
    return this.send('DELETE', path, options);
  }

  /** Build a full URL from the base URL and a (possibly empty) path. */
  protected buildUrl(path: string): string {
    if (!path) return this.baseUrl;
    if (/^https?:\/\//i.test(path)) return path;
    const base = this.baseUrl.replace(/\/+$/, '');
    const suffix = path.replace(/^\/+/, '');
    return `${base}/${suffix}`;
  }

  /** Normalize params to the string map Playwright expects. */
  private toStringParams(
    params?: Record<string, string | number | boolean>,
  ): Record<string, string> | undefined {
    if (!params) return undefined;
    return Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]));
  }

  private async send(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    options: RequestOptions,
  ): Promise<ApiResult> {
    const url = this.buildUrl(path);
    const { params, headers, data, maxRetries = 4, initialDelayMs = 500 } = options;
    const stringParams = this.toStringParams(params);

    await this.attach('API Request', { method, url, params: stringParams, headers, data });

    const response = await this.withRetry(
      () =>
        this.request.fetch(url, {
          method,
          params: stringParams,
          headers,
          data: data as any,
        }),
      maxRetries,
      initialDelayMs,
    );

    const text = await response.text();
    let body: any;
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }

    await this.attach('API Response', {
      status: response.status(),
      statusText: response.statusText(),
      headers: response.headers(),
      body,
    });

    return { response, body, status: response.status() };
  }

  /** Retry a request while it returns HTTP 429, backing off exponentially. */
  private async withRetry(
    fn: () => Promise<APIResponse>,
    maxRetries: number,
    initialDelayMs: number,
  ): Promise<APIResponse> {
    let lastResponse: APIResponse | undefined;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const response = await fn();
      lastResponse = response;
      if (response.status() !== 429) return response;
      if (attempt < maxRetries) {
        const delayMs = initialDelayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    return lastResponse as APIResponse;
  }

  /** Attach a JSON payload to the HTML report (no-op if testInfo is absent). */
  protected async attach(name: string, payload: unknown): Promise<void> {
    if (!this.testInfo) return;
    await this.testInfo.attach(name, {
      body: JSON.stringify(payload, null, 2),
      contentType: 'application/json',
    });
  }
}
