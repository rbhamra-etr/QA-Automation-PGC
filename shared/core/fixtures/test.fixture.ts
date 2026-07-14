import { expect, Page, BrowserContext } from '@playwright/test';
import { test as base } from 'playwright-bdd';
import { launchIncognitoBrowser, cleanupBrowser } from '../factories/browser.factory';
import { IAdaptivePage } from '../shared/iadaptive.page';
import { PageProvider } from './page-provider.fixture';

/**
 * Per-scenario shared state. `app` is the registry key of the system currently
 * under test (e.g. 'SFDC', 'Web'); it is intentionally a plain string so adding
 * a new system never requires editing this type.
 */
type SessionContext = {
  role?: string;
  app?: string;
  appPage?: Page;
  searchText?: string;
};

type AppFixtures = {
  session: SessionContext;
  /** Shared iAdaptive login gateway (not an app under test). */
  iadaptivePage: IAdaptivePage;
  /** Lazy provider of per-app page objects; access via pages.sfdc, pages.web, … */
  pages: PageProvider;
};

// Module-level storage so both `context` and `page` overrides share the same session.
let _browserSession: { context: BrowserContext; userDataDir: string } | undefined;

export const test = base.extend<AppFixtures>({
  // Override context first — launches the incognito session and stores it for `page` to reuse.
  context: async ({}, use) => {
    const { context, page: _p, userDataDir } = await launchIncognitoBrowser();
    _browserSession = { context, userDataDir };
    await use(context as unknown as BrowserContext);
    await cleanupBrowser(context, userDataDir);
    _browserSession = undefined;
  },

  // Override page to use the page already opened by the persistent context above.
  page: async ({ context }, use) => {
    const pages = (context as any).pages?.() ?? [];
    const page: Page = pages[0] ?? await (context as any).newPage();
    await use(page);
  },

  session: async ({}, use) => {
    await use({});
  },

  iadaptivePage: async ({ page }, use) => {
    await use(new IAdaptivePage(page));
  },

  pages: async ({ page }, use) => {
    await use(new PageProvider(page));
  },
});

export { expect };
