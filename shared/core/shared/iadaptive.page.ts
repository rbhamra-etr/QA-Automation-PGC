import { expect, Page, Locator, FrameLocator } from '@playwright/test';
import { getIAdaptiveUrl } from '../configs/env.config';
import { BasePage } from './base.page';

/**
 * IAdaptivePage — the SHARED login gateway, not an app under test.
 *
 * Many systems (SFDC, SAP, Fiori, Appian) are reached the same way: log in to the
 * iAdaptive portal, then click an application tile that opens the target app in a
 * popup. This class owns ONLY that generic capability — it knows nothing about what
 * any individual app does once it is open. Per-app tile text lives in the
 * app-registry, so adding a new portal app never requires touching this file.
 */
export class IAdaptivePage extends BasePage {
  // ── Locators (co-located) ─────────────────────────────────────────────────
  // Getters re-read `this.page` on every access, so they stay correct even after
  // the underlying page is swapped (e.g. switchToPage after a popup opens).
  private get usernameInput(): Locator {
    return this.page.locator(`(//input[@name='username'])[1]`);
  }
  private get usernameSubmitBtn(): Locator {
    return this.page.locator(`//div[@id='usernameForm']/div/button[@type='submit']`);
  }
  private get passwordInput(): Locator {
    return this.page.locator(`(//input[@name='answer'])[1]`);
  }
  private get passwordSubmitBtn(): Locator {
    return this.page.locator(`//div[@id='passwordForm']/div/button[@type='submit']`);
  }

  /** Nested portal iframe structure where the application links live. */
  private get portalFrame(): FrameLocator {
    return this.page
      .frameLocator(`iframe[name='userportal']`)
      .frameLocator(`iframe[id='identity-userprofile-id']`);
  }

  /** Application launch link (by visible link text) inside the portal iframe. */
  private appLink(linkText: string): Locator {
    return this.portalFrame.locator(`//a[text()="${linkText}"]`);
  }

  async open(): Promise<void> {
    const url = getIAdaptiveUrl();
    if (!url) throw new Error('IADAPTIVE_ACCESS_URL is not set. Add it to .env.qa or .env.uat.');
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async login(username: string, password: string): Promise<void> {
    const usernameField = this.usernameInput;
    const nextBtn = this.usernameSubmitBtn;
    const passwordField = this.passwordInput;
    const signInBtn = this.passwordSubmitBtn;

    // Step 1: Enter username — wait for the field to be interactive, no fixed sleeps
    await usernameField.waitFor({ state: 'visible', timeout: 60000 });
    await usernameField.click();
    await usernameField.fill('');
    await usernameField.pressSequentially(username, { delay: 50 });

    // Click Next
    await expect(nextBtn).toBeEnabled({ timeout: 10000 });
    await nextBtn.click();

    // Step 2: Enter password — wait for field to appear after navigation
    await passwordField.waitFor({ state: 'visible', timeout: 60000 });
    await passwordField.click();
    await passwordField.fill('');
    await passwordField.pressSequentially(password, { delay: 50 });

    // Click Sign In
    await expect(signInBtn).toBeEnabled({ timeout: 10000 });
    await signInBtn.click();

    // Wait for portal to load
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle', { timeout: 120000 }).catch(() => {});
  }

  /**
   * Launch an application from the iAdaptive portal by its visible tile text.
   * The link lives inside nested iframes and opens a popup (new tab).
   * Returns the new Page object for the opened application.
   *
   * @param tileText The portal tile/link text (resolved from the app-registry).
   */
  async openApplicationByTile(tileText: string): Promise<Page> {
    const appLink = this.appLink(tileText);
    await appLink.waitFor({ state: 'visible', timeout: 60000 });

    // Click the link — it opens a popup (new tab)
    const [appPage] = await Promise.all([
      this.page.waitForEvent('popup'),
      appLink.click(),
    ]);

    await appPage.waitForLoadState('domcontentloaded');
    await appPage.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});

    return appPage;
  }
}
