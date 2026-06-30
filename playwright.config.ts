import { defineConfig, devices } from '@playwright/test';
import { cucumberReporter, defineBddConfig } from 'playwright-bdd';
import dotenv from 'dotenv';
import path from 'path';

// Load environment-specific .env file.
// Default is QA. Switch with:  ENV=uat npm test
const env = (process.env.ENV ?? 'qa').toLowerCase();
dotenv.config({ path: path.resolve(__dirname, `.env.${env}`) });

// ============================================================================
// EXECUTION — single source of truth for HOW tests run.
//
// Edit values here to control headless, browser channel, action timeouts,
// retry counts, and the Playwright runner settings. Each value falls back to an
// environment variable (so CI can still override) and finally to a hard default.
// Page objects and the browser factory read from this object — do NOT scatter
// these settings across other files.
// ============================================================================
const toPositiveNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const toPositiveInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const defaultActionTimeoutMs = toPositiveNumber(
  process.env.DEFAULT_TIMEOUT_MS ?? process.env.DEFAULT_TIMEOUT,
  30_000,
);
const defaultRetryCount = toPositiveInt(process.env.DEFAULT_RETRY_COUNT, 3);

export const EXECUTION = {
  /** Run Chrome headless. Default headed; set HEADLESS=true to override. */
  headless: process.env.HEADLESS === 'true',

  /** Chrome distribution channel used by the browser factory. */
  channel: process.env.BROWSER_CHANNEL?.trim() || 'chrome',

  /** Per-app action timeouts (ms) consumed by page objects. */
  timeout: {
    default: defaultActionTimeoutMs,
    iadaptive: toPositiveNumber(process.env.IADAPTIVE_TIMEOUT_MS, defaultActionTimeoutMs),
    sfdc: toPositiveNumber(process.env.SFDC_TIMEOUT_MS, defaultActionTimeoutMs),
  },

  /** Per-app retry counts consumed by page objects' retryAction(). */
  retry: {
    default: defaultRetryCount,
    iadaptive: toPositiveInt(process.env.IADAPTIVE_RETRY_COUNT, defaultRetryCount),
    sfdc: toPositiveInt(process.env.SFDC_RETRY_COUNT, defaultRetryCount),
  },

  /** Playwright runner settings. */
  testTimeoutMs: toPositiveNumber(process.env.TEST_TIMEOUT_MS, 120_000),
  runnerRetries: Number.isInteger(Number(process.env.RUNNER_RETRIES))
    ? Number(process.env.RUNNER_RETRIES)
    : process.env.CI
      ? 2
      : 0,
  workers: process.env.WORKERS ? toPositiveInt(process.env.WORKERS, 1) : process.env.CI ? 1 : undefined,
} as const;

const testDir = defineBddConfig({
  paths: ['features/**/*.feature'],
  require: [
    'core/fixtures/test.fixture.ts',
    'step-definitions/api/common.api.steps.ts',
    'step-definitions/api/context.api.ts',
    'step-definitions/api/toll-rate.api.steps.ts',
    'step-definitions/appian/home.appian.steps.ts',
    'step-definitions/iadaptive/home.iadaptive.steps.ts',
    'step-definitions/sap/invoice.sap.steps.ts',
    'step-definitions/sfdc/case.sfdc.steps.ts',
    'step-definitions/sfdc/common.sfdc.steps.ts',
    'step-definitions/sfdc/login.sfdc.steps.ts',
    'step-definitions/sfdc/request-fasteners.steps.ts',
    'step-definitions/sfdc/user-list.sfdc.steps.ts',
    'step-definitions/web/home.web.steps.ts',
    'step-definitions/web/login.web.steps.ts',
    'step-definitions/web/web-login-common.steps.ts',
  ],
});

/**
 * See https://playwright.dev/docs/test-configuration.
 * Browser launch is handled in src/core/browser-factory.ts — not here.
 * playwright.config.ts only defines the test project shell so Playwright
 * knows to run tests; all Chrome args, incognito, and cleanup live in the factory.
 * Control headed/headless: set HEADLESS=true in env for CI.
 */
export default defineConfig({
  testDir,
  timeout: EXECUTION.testTimeoutMs, // configured in EXECUTION above
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: EXECUTION.runnerRetries,
  workers: EXECUTION.workers,
  reporter: [
    ['html', { outputFolder: 'reports/playwright', open: 'never' }],
    cucumberReporter('json', { outputFile: 'reports/cucumber/cucumber-report.json' }),
    ['./scripts/rich-cucumber-reporter.cjs'],
    //cucumberReporter('html', { outputFile: 'reports/cucumber/cucumber-report.html' }),
  ],

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chrome',
      grepInvert: /@api/,
    },
    {
      name: 'api',
      use: {
        baseURL: process.env.TOLL_API_BASE_URL?.trim(),
      },
      grep: /@api/,
    },
  ],
});
