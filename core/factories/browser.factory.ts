/**
 * browser-factory.ts
 *
 * Launches Chrome using a PERSISTENT CONTEXT with a unique temp user-data directory.
 * This is the only reliable way to get a real incognito-equivalent session with Playwright,
 * because --incognito is ignored when Playwright owns the context layer.
 *
 * Each test run:
 *   1. Creates a fresh temp profile directory  → no cached credentials / cookies
 *   2. Launches your installed Chrome via `channel: 'chrome'`
 *   3. Clears any residual cookies and permissions immediately after launch
 *   4. Strips auth headers (authorization, www-authenticate, proxy-authorization) from all requests
 *   5. Deletes the temp directory when cleanup() is called (after the test)
 */

import { chromium, BrowserContext } from '@playwright/test';
import fs from 'fs';
import os from 'os';
import path from 'path';
import type { BrowserSession } from '../types/browser.type';
import { CHROME_ARGS, AUTH_HEADERS_TO_STRIP } from '../consts/browser.const';

export type { BrowserSession } from '../types/browser.type';

export async function launchIncognitoBrowser(): Promise<BrowserSession> {
  const isHeadless = process.env.HEADLESS === 'true';

  // Unique temp directory — guarantees a clean profile for every test run
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pw-chrome-'));

  const context = await chromium.launchPersistentContext(userDataDir, {
    channel: 'chrome',
    headless: isHeadless,
    viewport: isHeadless ? { width: 1920, height: 1080 } : null,
    deviceScaleFactor: isHeadless ? 1 : undefined,
    args: CHROME_ARGS,
    ignoreHTTPSErrors: true,
    bypassCSP: true,
  });

  // Belt-and-braces: clear any cookies/permissions Chrome may have loaded from the temp dir
  await context.clearCookies();
  await context.clearPermissions();

  // Strip auth headers so Windows SSO cannot silently authenticate via the browser
  await context.route('**/*', (route) => {
    const headers = { ...route.request().headers() };
    for (const header of AUTH_HEADERS_TO_STRIP) {
      delete headers[header];
    }
    route.continue({ headers });
  });

  // Use existing page (persistent context opens one automatically) or open a new one
  const page = context.pages()[0] ?? (await context.newPage());

  return { context, page, userDataDir };
}

export async function cleanupBrowser(context: BrowserContext, userDataDir: string): Promise<void> {
  try {
    await context.close();
  } catch {
    // ignore if already closed
  }
  try {
    fs.rmSync(userDataDir, { recursive: true, force: true });
  } catch {
    // ignore cleanup errors (e.g. Windows file locks)
  }
}
