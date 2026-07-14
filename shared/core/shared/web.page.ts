import { expect, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * WebPage — the standalone company web application.
 *
 * Unlike SFDC/SAP/Fiori/Appian, Web is NOT launched through iAdaptive. It has its
 * own URL and its own credentials, so this page object owns its login flow.
 *
 * NOTE: The locators below are sensible defaults. Adjust the selectors to match
 * the real Web app's login form when its markup is known.
 */
export class WebPage extends BasePage {
  // ── Locators (co-located) ─────────────────────────────────────────────────
  private get userIdInput(): Locator {
    return this.page.locator(
      `input[name='username'], input[name='userId'], input[name='email'], input[id='username'], input[id='userId'], input[id='email'], input[type='email'], input[autocomplete='username'], #username, #userId, #email`,
    );
  }
  private get myAccountButton(): Locator {
    return this.page.locator(
      `nav button:has-text('My Account'), header button:has-text('My Account'), button:has-text('My Account')`,
    );
  }
  private get cookieOkayButton(): Locator {
    return this.page.locator(
      `button:has-text('Okay'), button:has-text('OK'), button:has-text('I Accept')`,
    );
  }
  private get outageCloseButton(): Locator {
    return this.page.locator(
      `button:has([data-testid='CloseIcon']), button[aria-label='Close'], button[title='Close']`,
    );
  }
  private get accountLoginLink(): Locator {
    return this.page.locator(
      `a[href*='/myaccount/auth/login'], a:has-text('Log in'), button:has-text('Log in')`,
    );
  }
  private get passwordInput(): Locator {
    return this.page.locator(
      `input[name='password']:not(.hide):not([aria-hidden='true']):visible, input[type='password']:not(.hide):not([aria-hidden='true']):visible, #password:visible`,
    );
  }
  private get continueButton(): Locator {
    return this.page.locator(`button:has-text('Continue'), button[type='submit']:has-text('Continue')`);
  }
  private get usernameNextButton(): Locator {
    return this.page.locator(
      `button:has-text('Next'), button:has-text('Continue'), button:has-text('Submit'), button[type='submit']`,
    );
  }
  private get loginButton(): Locator {
    return this.page.locator(
      `button[type='submit'], button:has-text('Sign in'), button:has-text('Log in'), button:has-text('Login')`,
    );
  }
  private get loginErrorMessage(): Locator {
    return this.page.locator(
      `[role='alert'], .alert, .error, .error-message, .validation-summary-errors, text=/invalid|incorrect|failed|unable|try again/i`,
    );
  }
  private get dashboardMarker(): Locator {
    return this.page.locator(
      `[data-testid*='dashboard'], [id*='dashboard'], h1:has-text('Dashboard'), h1:has-text('Home'), h1:has-text('My Account')`,
    );
  }
  private get dashboardTextMarker(): Locator {
    return this.page.getByText(/welcome|account summary|dashboard/i);
  }
  private get loginForm(): Locator {
    return this.page.locator(`form:has(input[type='password'])`);
  }

  private get preLoginDelayMs(): number {
    const raw = process.env.WEB_PRE_LOGIN_DELAY_MS?.trim();
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 1200;
  }

  private get passwordStepDelayMs(): number {
    const raw = process.env.WEB_PASSWORD_STEP_DELAY_MS?.trim();
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 700;
  }

  private get passwordTypeDelayMs(): number {
    const raw = process.env.WEB_PASSWORD_TYPE_DELAY_MS?.trim();
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 80;
  }

  private get beforeLoginClickDelayMs(): number {
    const raw = process.env.WEB_BEFORE_LOGIN_CLICK_DELAY_MS?.trim();
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 500;
  }

  private async waitForHomeToSettleBeforeLoginClick(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await this.page.waitForTimeout(this.preLoginDelayMs);
  }

  private async dismissCookieBannerIfPresent(): Promise<void> {
    const cookieOverride = process.env.WEB_COOKIE_OK_SELECTOR?.trim();
    const target = cookieOverride
      ? this.page.locator(cookieOverride).first()
      : this.cookieOkayButton.first();

    const visible = await target.isVisible().catch(() => false);
    if (!visible) {
      return;
    }

    await expect(target).toBeEnabled({ timeout: 5000 });
    await target.click();
  }

  private async dismissOutageBannerIfPresent(): Promise<void> {
    const outageOverride = process.env.WEB_OUTAGE_CLOSE_SELECTOR?.trim();
    const target = outageOverride
      ? this.page.locator(outageOverride).first()
      : this.outageCloseButton.first();

    const visible = await target.isVisible().catch(() => false);
    if (!visible) {
      return;
    }

    await expect(target).toBeEnabled({ timeout: 5000 });
    await target.click();
  }

  async openLoginPage(baseUrl: string): Promise<void> {
    await this.page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await this.waitForHomeToSettleBeforeLoginClick();
    await this.dismissCookieBannerIfPresent();
    await this.dismissOutageBannerIfPresent();

    const userIdVisible = await this.userIdInput.first().isVisible().catch(() => false);
    if (!userIdVisible) {
      const overrideSelector = process.env.WEB_MY_ACCOUNT_SELECTOR?.trim();
      const popupPromise = this.page.context().waitForEvent('page', { timeout: 5000 }).catch(() => null);

      if (overrideSelector) {
        const target = this.page.locator(overrideSelector).first();
        await target.waitFor({ state: 'visible', timeout: 30000 });
        await expect(target).toBeEnabled({ timeout: 30000 });
        await target.click();
      } else {
        const target = this.myAccountButton.first();
        await target.waitFor({ state: 'visible', timeout: 30000 });
        await expect(target).toBeEnabled({ timeout: 30000 });
        await target.click();
      }

      const popup = await popupPromise;
      if (popup) {
        await popup.waitForLoadState('domcontentloaded');
        this.switchToPage(popup);
      }

      const userIdVisibleAfterAccountClick = await this.userIdInput.first().isVisible().catch(() => false);
      if (!userIdVisibleAfterAccountClick) {
        const loginLinkOverride = process.env.WEB_ACCOUNT_LOGIN_SELECTOR?.trim();

        if (loginLinkOverride) {
          const target = this.page.locator(loginLinkOverride).first();
          await target.waitFor({ state: 'visible', timeout: 30000 });
          await expect(target).toBeEnabled({ timeout: 30000 });
          await target.click();
        } else {
          const target = this.accountLoginLink.first();
          await target.waitFor({ state: 'visible', timeout: 30000 });
          await expect(target).toBeEnabled({ timeout: 30000 });
          await target.click();
        }

        await this.page.waitForLoadState('domcontentloaded');
      }

      // Many implementations route to /myaccount first, then render the login inputs.
      await this.page.waitForURL(/myaccount|auth|login/i, { timeout: 30000 }).catch(() => {});
    }

    await this.userIdInput.first().waitFor({ state: 'visible', timeout: 60000 });
  }

  private async isPasswordStepVisible(): Promise<boolean> {
    return this.passwordInput.first().isVisible().catch(() => false);
  }

  private async goToPasswordStep(): Promise<void> {
    if (await this.isPasswordStepVisible()) {
      return;
    }

    const overrideSelector = process.env.WEB_USERNAME_NEXT_SELECTOR?.trim();

    if (overrideSelector) {
      const target = this.page.locator(overrideSelector).first();
      await target.waitFor({ state: 'visible', timeout: 30000 });
      await expect(target).toBeEnabled({ timeout: 30000 });
      await target.click();
    } else {
      const continueVisible = await this.continueButton.first().isVisible().catch(() => false);
      if (continueVisible) {
        const target = this.continueButton.first();
        await expect(target).toBeEnabled({ timeout: 30000 });
        await target.click();
      } else {
        const nextVisible = await this.usernameNextButton.first().isVisible().catch(() => false);
        if (nextVisible) {
          await this.usernameNextButton.first().click();
        } else {
          await this.userIdInput.first().press('Enter');
        }
      }
    }

    await this.page.waitForTimeout(this.passwordStepDelayMs);
    await expect
      .poll(async () => this.passwordInput.first().isVisible().catch(() => false), { timeout: 30000 })
      .toBeTruthy();
  }

  async enterCredentials(userId: string, password: string): Promise<void> {
    await this.userIdInput.first().fill(userId);
    await this.goToPasswordStep();

    const passwordField = this.passwordInput.first();
    await expect(passwordField).toBeEnabled({ timeout: 30000 });
    await passwordField.click();
    await passwordField.fill('');
    await passwordField.pressSequentially(password, { delay: this.passwordTypeDelayMs });

    await expect
      .poll(async () => (await passwordField.inputValue()).length, { timeout: 10000 })
      .toBeGreaterThan(0);
  }

  async clickLoginButton(): Promise<void> {
    const passwordField = this.passwordInput.first();
    await passwordField.waitFor({ state: 'visible', timeout: 30000 });
    await expect(passwordField).toBeEnabled({ timeout: 30000 });

    await this.page.waitForTimeout(this.beforeLoginClickDelayMs);

    const loginBtn = this.loginButton.first();
    await loginBtn.waitFor({ state: 'visible', timeout: 30000 });
    await expect(loginBtn).toBeEnabled({ timeout: 30000 });
    await loginBtn.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async verifyRedirectedToHomePage(): Promise<void> {
    const expectedUrlPart = process.env.WEB_HOME_URL_CONTAINS?.trim() || '/myaccount/';

    await expect
      .poll(() => this.page.url(), { timeout: 45000 })
      .toContain(expectedUrlPart);

    // Ensure we are not stuck on auth/login callback routes.
    await expect
      .poll(() => this.page.url(), { timeout: 45000 })
      .not.toMatch(/\/auth\/login|\/u\/login|\/signin|\/login\?/i);

    await this.page.waitForLoadState('domcontentloaded');
  }

  async verifyDashboardVisible(): Promise<void> {
    const selectorOverride = process.env.WEB_HOME_MARKER_SELECTOR?.trim();
    if (selectorOverride) {
      await this.page.locator(selectorOverride).first().waitFor({ state: 'visible', timeout: 30000 });
      return;
    }

    await expect
      .poll(
        async () => {
          const byStructure = await this.dashboardMarker.first().isVisible().catch(() => false);
          const byText = await this.dashboardTextMarker.first().isVisible().catch(() => false);
          return byStructure || byText;
        },
        { timeout: 30000 },
      )
      .toBeTruthy();
  }

  async verifyStillOnLoginPage(): Promise<void> {
    await expect
      .poll(
        async () => {
          const userStepVisible = await this.userIdInput.first().isVisible().catch(() => false);
          const passwordStepVisible = await this.passwordInput.first().isVisible().catch(() => false);
          return userStepVisible || passwordStepVisible;
        },
        { timeout: 20000 },
      )
      .toBeTruthy();

    const loginUrlHint = process.env.WEB_LOGIN_URL_CONTAINS?.trim();
    if (loginUrlHint) {
      await expect.poll(() => this.page.url(), { timeout: 20000 }).toContain(loginUrlHint);
      return;
    }

    const hasUserStep = await this.userIdInput.first().isVisible().catch(() => false);
    const hasPasswordStep = await this.loginForm.first().isVisible().catch(() => false);
    expect(hasUserStep || hasPasswordStep).toBeTruthy();
  }

  async verifyLoginErrorMessage(): Promise<void> {
    const errorSelectorOverride = process.env.WEB_LOGIN_ERROR_SELECTOR?.trim();
    if (errorSelectorOverride) {
      await this.page.locator(errorSelectorOverride).first().waitFor({ state: 'visible', timeout: 20000 });
      return;
    }

    await this.loginErrorMessage.first().waitFor({ state: 'visible', timeout: 20000 });
  }

  /**
   * Navigate to the standalone Web app and authenticate with its own credentials.
   * @param baseUrl  Resolved from WEB_BASE_URL via the app-registry.
   */
  async loginAt(baseUrl: string, username: string, password: string): Promise<void> {
    await this.openLoginPage(baseUrl);
    await this.enterCredentials(username, password);
    await this.clickLoginButton();
    await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  }
}
