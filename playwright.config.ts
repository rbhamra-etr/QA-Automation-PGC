import { defineConfig, devices } from '@playwright/test';
import { cucumberReporter, defineBddConfig } from 'playwright-bdd';
import dotenv from 'dotenv';
import path from 'path';

// Load environment-specific .env file.
// Default is QA. Switch with:  ENV=uat npm test
const env = (process.env.ENV ?? 'qa').toLowerCase();
dotenv.config({ path: path.resolve(__dirname, `.env.${env}`) });

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
  timeout: 120_000,        // 2 min — enough for login + nested iframe load under shared-node load
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
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
