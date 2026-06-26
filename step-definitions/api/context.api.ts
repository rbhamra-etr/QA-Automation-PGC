import type { ApiResult } from '../../core/models/base-api.model';
import type { ApiContext } from '../../core/models/api-context.model';

export type { ApiContext } from '../../core/models/api-context.model';

/**
 * api-context.ts — per-scenario state shared between generic API steps and any
 * service-specific steps (e.g. toll). It holds the most recent request/response
 * so that follow-up "Then the response status should be ..." style steps work
 * regardless of which service made the call.
 *
 * A single module-level instance is used because BDD steps in a scenario run
 * sequentially in one worker; playwright-bdd isolates workers per test file.
 */

export const apiContext: ApiContext = { meta: {} };

/** Reset between scenarios (call from a Before hook if strict isolation is needed). */
export function resetApiContext(): void {
  apiContext.last = undefined;
  apiContext.meta = {};
}

/** Convenience accessor that throws a clear error if no call has been made yet. */
export function requireLastResult(): ApiResult {
  if (!apiContext.last) {
    throw new Error(
      'No API response is available yet. Make a request step (e.g. "When I send a GET request to ...") before asserting on the response.',
    );
  }
  return apiContext.last;
}
