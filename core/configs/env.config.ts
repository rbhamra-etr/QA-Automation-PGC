import * as dotenv from 'dotenv';

dotenv.config();

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseRetryCount = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const defaultTimeoutMs = parseNumber(process.env['DEFAULT_TIMEOUT_MS'] ?? process.env['DEFAULT_TIMEOUT'], 30000);
const defaultRetryCount = parseRetryCount(process.env['DEFAULT_RETRY_COUNT'], 3);

export const ENV = {
  WEB_BASE_URL: process.env['WEB_BASE_URL'] ?? 'https://www.qat.nonprd.407etr.com',
  IADAPTIVE_ACCESS_URL:
    process.env['IADAPTIVE_ACCESS_URL'] ??
    'https://aba0200.cyberark.cloud/userportal/identity/MyApps/VHJlZVRhYjphbGw%3D',
  SFDC_RUN_URL: process.env['SFDC_RUN_URL'],
  SFDC_ENV: process.env['SFDC_ENV'] ?? 'SFDC_QA2',
  HEADLESS: process.env['HEADLESS'] !== 'false',
  SLOW_MO: Number(process.env['SLOW_MO'] ?? 0),
  DEFAULT_TIMEOUT_MS: defaultTimeoutMs,
  DEFAULT_TIMEOUT: defaultTimeoutMs,
  IADAPTIVE_TIMEOUT_MS: parseNumber(process.env['IADAPTIVE_TIMEOUT_MS'], defaultTimeoutMs),
  SFDC_TIMEOUT_MS: parseNumber(process.env['SFDC_TIMEOUT_MS'], defaultTimeoutMs),
  DEFAULT_RETRY_COUNT: defaultRetryCount,
  IADAPTIVE_RETRY_COUNT: parseRetryCount(process.env['IADAPTIVE_RETRY_COUNT'], defaultRetryCount),
  SFDC_RETRY_COUNT: parseRetryCount(process.env['SFDC_RETRY_COUNT'], defaultRetryCount),
  BROWSER_CHANNEL: process.env['BROWSER_CHANNEL'],
  BROWSER_EXECUTABLE_PATH: process.env['BROWSER_EXECUTABLE_PATH'],
};

/**
 * env.ts — reads credentials from process.env (populated by playwright.config.ts via dotenv).
 *
 * Credential key convention — APP prefix + ROLE suffix:
 *   app='SFDC', role='CSR'              →  SFDC_CSR_USERNAME / SFDC_CSR_PASSWORD
 *   app='SFDC', role='Dig Sup Mgr'      →  SFDC_DIG_SUP_MGR_USERNAME / SFDC_DIG_SUP_MGR_PASSWORD
 *   app='SAP',  role='CSR'              →  SAP_CSR_USERNAME  / SAP_CSR_PASSWORD
 *   app='Appian' (single user, no role) →  APPIAN_USERNAME   / APPIAN_PASSWORD
 *   app='Web',  role='Customer'         →  WEB_CUSTOMER_USERNAME / WEB_CUSTOMER_PASSWORD
 */

function normalize(text: string): string {
  return text.trim().toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
}

/** Base URL of the shared iAdaptive login portal. */
export function getIAdaptiveUrl(): string {
  return process.env.IADAPTIVE_URL ?? '';
}

/**
 * Look up credentials for a given app + role combination.
 * @param app   e.g. 'SFDC', 'SAP', 'Appian'
 * @param role  e.g. 'CSR', 'Dig Sup Mgr'  (omit for single-user apps like Appian)
 */
export function getUserCredentials(
  app: string,
  role?: string,
): { username: string; password: string } {
  const appKey = normalize(app);
  const prefix = role ? `${appKey}_${normalize(role)}` : appKey;

  const username = process.env[`${prefix}_USERNAME`];
  const password = process.env[`${prefix}_PASSWORD`];

  if (!username || !password) {
    const example = role
      ? `${prefix}_USERNAME and ${prefix}_PASSWORD`
      : `${appKey}_USERNAME and ${appKey}_PASSWORD`;
    throw new Error(
      `Missing credentials for app='${app}'${role ? `, role='${role}'` : ''}.\n` +
      `Add ${example} to your .env.qa or .env.uat file.`,
    );
  }

  return { username, password };
}
