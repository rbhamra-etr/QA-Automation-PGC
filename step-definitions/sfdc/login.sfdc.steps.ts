import { createBdd } from 'playwright-bdd';
import { getUserCredentials } from '../../core/configs/env.config';
import {
  getUiApp,
  resolveTile,
  resolveStandaloneUrl,
} from '../../core/configs/app-registry.config';
import { test } from '../../core/fixtures/test.fixture';

const { Given } = createBdd(test);

/**
 * Generic, registry-driven login steps. These replace the old per-app login
 * steps — one step now logs into ANY system. To support a new app, add it to
 * src/config/app-registry.ts; no new step code is required here.
 */

// ── Role-based login (apps that distinguish users by role) ───────────────────
// Examples:
//   Given I am logged into "SFDC" as "CSR"
//   Given I am logged into "Web" as "Customer"
Given('I am logged into {string} as {string}',
  async ({ iadaptivePage, pages, session }, appKey: string, role: string) => {
    const app = getUiApp(appKey);
    const { username, password } = getUserCredentials(app.credentialKey ?? app.key, role);

    const appPage =
      app.launch === 'iadaptive'
        ? await (async () => {
            await iadaptivePage.open();
            await iadaptivePage.login(username, password);
            return iadaptivePage.openApplicationByTile(resolveTile(app));
          })()
        : await pages.openStandalone(app.key, resolveStandaloneUrl(app), username, password);

    pages.bind(app.key, appPage);
    session.appPage = appPage;
    session.app = app.key;
    session.role = role;
  },
);

// ── Single-user login (apps with one shared account, no role) ────────────────
// Examples:
//   Given I am logged into "Appian"
Given(
  'I am logged in to {string}',
  async ({ iadaptivePage, pages, session }, appKey: string) => {
    const app = getUiApp(appKey);
    const { username, password } = getUserCredentials(app.credentialKey ?? app.key);

    const appPage =
      app.launch === 'iadaptive'
        ? await (async () => {
            await iadaptivePage.open();
            await iadaptivePage.login(username, password);
            return iadaptivePage.openApplicationByTile(resolveTile(app));
          })()
        : await pages.openStandalone(app.key, resolveStandaloneUrl(app), username, password);

    pages.bind(app.key, appPage);
    session.appPage = appPage;
    session.app = app.key;
  },
);
