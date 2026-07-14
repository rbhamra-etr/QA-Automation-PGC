import type { BrowserContext, Page } from '@playwright/test';

export type BrowserSession = {
  context: BrowserContext;
  page: Page;
  userDataDir: string;
};
