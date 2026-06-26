import type { LaunchMode } from '../types/app-registry.type';

export interface UiAppConfig {
  /** Canonical key used in Gherkin, e.g. "SFDC". Case-insensitive at lookup time. */
  key: string;
  /** Human-friendly name for reports/errors. */
  label: string;
  /** How this app is launched. */
  launch: LaunchMode;
  /**
   * Credential prefix used by env.ts (APP part of APP_ROLE convention).
   * Defaults to `key` when omitted. e.g. 'SFDC' → SFDC_<ROLE>_USERNAME.
   */
  credentialKey?: string;
  /**
   * For `launch: 'iadaptive'` — the visible tile/link text inside the portal.
   * Overridable per-environment via the env var named in `tileEnvVar`.
   */
  tile?: string;
  /** Env var name that, if set, overrides `tile` at runtime. */
  tileEnvVar?: string;
  /**
   * For `launch: 'standalone'` — env var holding the app's base URL,
   * e.g. 'WEB_BASE_URL'. The standalone login step navigates here.
   */
  urlEnvVar?: string;
}

export interface ApiServiceConfig {
  /** Canonical key used in Gherkin, e.g. "Toll". Case-insensitive at lookup time. */
  key: string;
  /** Human-friendly name for reports/errors. */
  label: string;
  /** Env var holding this service's base URL, e.g. 'TOLL_API_BASE_URL'. */
  baseUrlEnvVar: string;
}
