import type { ApiResult } from './base-api.model';

export interface ApiContext {
  /** Result of the most recent API call. */
  last?: ApiResult;
  /** Free-form bag for service-specific steps to stash request inputs. */
  meta: Record<string, unknown>;
}
