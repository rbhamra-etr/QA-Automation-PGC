import { Frame } from '@playwright/test';
import { BasePage } from '../../core/shared/base.page';
import { ENV } from '../../core/configs/env.config';
import { EXECUTION } from '../../playwright.config';

export class IAdaptiveHomePage extends BasePage {
  // Selectors
  private readonly accessNav = this.page.getByRole('navigation');
  private readonly loginUsernameInput = this.page.getByRole('textbox', { name: /username/i });
  private readonly welcomeGuideDialogContent = this.page.getByTestId('welcome-guide-dialog-content');
  private readonly uniguidanceAppDialogIframe = this.page.locator('[data-testid="uniguidance-app-dialog-iframe"]');
  private readonly modalRoot = this.page.locator(
    '[data-testid="welcome-guide-dialog-content"], [data-testid="uniguidance-app-dialog-iframe"], [role="dialog"], [aria-modal="true"], #uniguidance-integrator-root, iframe[title*="welcome" i]'
  );

  private getTileCandidates(frame: Frame, tileName: string) {
    const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedTileName = escapeRegExp(tileName);

    return [
      frame.getByRole('link', { name: new RegExp(`^\\s*${escapedTileName}\\s*$`, 'i') }),
      frame.getByRole('button', { name: new RegExp(`^\\s*${escapedTileName}\\s*$`, 'i') }),
      frame.getByRole('link', { name: new RegExp(escapedTileName, 'i') }),
      frame.getByRole('button', { name: new RegExp(escapedTileName, 'i') }),
      frame.locator(`a:has-text("${tileName}")`),
      frame.locator(`button:has-text("${tileName}")`),
      frame.getByRole('link', { name: /sfdc/i }),
      frame.getByRole('button', { name: /sfdc/i }),
      frame.locator('a:has-text("SFDC"), button:has-text("SFDC")'),
    ];
  }

  async navigateToAccessPortal(): Promise<void> {
    await this.page.goto(ENV.IADAPTIVE_ACCESS_URL, { waitUntil: 'domcontentloaded' });
    await this.accessNav.first().waitFor({ state: 'visible', timeout: EXECUTION.timeout.iadaptive });
  }

  async navigate(): Promise<void> {
    await this.navigateToAccessPortal();
  }

  async isAccessPageVisible(): Promise<boolean> {
    const timeout = this.resolveTimeout(undefined, EXECUTION.timeout.iadaptive);
    try {
      await this.accessNav.first().waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async closeModalIfVisible(timeoutMs?: number, retries?: number): Promise<void> {
    const timeout = this.resolveTimeout(timeoutMs, EXECUTION.timeout.iadaptive);
    const attempts = this.resolveRetries(retries, EXECUTION.retry.iadaptive);

    await this.retryAction(
      'Close IAdaptive modal if visible',
      async () => {
        const isModalOpen =
          (await this.welcomeGuideDialogContent.first().isVisible().catch(() => false)) ||
          (await this.uniguidanceAppDialogIframe.first().isVisible().catch(() => false)) ||
          ((await this.modalRoot.count()) > 0 && (await this.modalRoot.first().isVisible().catch(() => false)));

        if (!isModalOpen) {
          return;
        }

        const closeSelectors = [
          this.page.frameLocator('[data-testid="uniguidance-app-dialog-iframe"]').getByTestId('dialog-close-icon'),
          this.page.getByRole('button', { name: /got it/i }),
          this.page.getByRole('button', { name: /^close$/i }),
          this.page.getByRole('button', { name: /close/i }),
          this.page.locator('button[aria-label*="close" i], button[title*="close" i]'),
          this.page.locator('[role="button"][aria-label*="close" i]'),
          this.page.locator('button:has-text("Dismiss")'),
        ];

        for (const closeSelector of closeSelectors) {
          if ((await closeSelector.count()) > 0 && (await closeSelector.first().isVisible().catch(() => false))) {
            await closeSelector.first().click({ timeout: Math.min(timeout, 4000), force: true });
            await this.page.waitForTimeout(400);
          }
        }

        if ((await this.modalRoot.count()) > 0 && (await this.modalRoot.first().isVisible().catch(() => false))) {
          await this.page.keyboard.press('Escape').catch(() => undefined);
          await this.page.waitForTimeout(300);
        }
      },
      attempts
    );
  }

  async launchSfdcApp(timeoutMs?: number, retries?: number): Promise<void> {
    const timeout = this.resolveTimeout(timeoutMs, EXECUTION.timeout.iadaptive);
    const attempts = this.resolveRetries(retries, EXECUTION.retry.iadaptive);
    const tileName = ENV.SFDC_ENV.trim();

    if (!tileName) {
      throw new Error('SFDC_ENV is empty. Set SFDC_ENV in your .env file to the exact IAdaptive SFDC tile label.');
    }

    await this.retryAction(
      'Launch SFDC app from IAdaptive',
      async () => {
        await this.page.waitForLoadState('domcontentloaded');

        if (/my\.idadaptive\.app\/login/i.test(this.page.url())) {
          throw new Error(
            `IAdaptive login page is displayed (${this.page.url()}). ` +
              'Portal session is not authenticated, so SFDC tile is unavailable.'
          );
        }

        if ((await this.loginUsernameInput.count()) > 0 && (await this.loginUsernameInput.first().isVisible().catch(() => false))) {
          throw new Error(
            `IAdaptive login page is displayed (${this.page.url()}). ` +
              'Portal session is not authenticated, so SFDC tile is unavailable.'
          );
        }

        await this.closeModalIfVisible(Math.min(timeout, 7000), attempts);

        const frames = this.page.frames();
        for (const frame of frames) {
          const candidateLocators = this.getTileCandidates(frame, tileName);
          for (const candidate of candidateLocators) {
            if ((await candidate.count()) > 0) {
              await candidate.first().scrollIntoViewIfNeeded().catch(() => undefined);
              await candidate.first().click({ timeout, force: true });
              return;
            }
          }
        }

        if (ENV.SFDC_RUN_URL) {
          await this.page.goto(ENV.SFDC_RUN_URL, { waitUntil: 'domcontentloaded', timeout });
          return;
        }

        throw new Error('SFDC tile not found from candidate selectors and SFDC_RUN_URL is not configured.');
      },
      attempts,
      500
    );

    return;
  }

  async isDisplayed(): Promise<boolean> {
    return this.isAccessPageVisible();
  }
}
