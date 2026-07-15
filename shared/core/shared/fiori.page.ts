import { BasePage } from './base.page';
import { sapCommonLocators } from '../../apps/sap/locators/common.locators';

/**
 * FioriPage — actions for the SAP Fiori application.
 *
 * Fiori is launched through the iAdaptive portal (see app-registry.ts), so this
 * class does NOT own a login flow — the generic login step handles that and binds
 * the opened popup to this page object via PageProvider.bind().
 *
 * Add page actions as business methods. Co-locate locators as private getters,
 * following the SFDC page object as the reference.
 */
export class FioriPage extends BasePage {
  /**
   * Wait for SAP Fiori shell readiness.
   * Confirms shell/header visibility and busy overlays are gone.
   */
  protected async waitForShellLoaded(timeoutMs = 30000): Promise<void> {
    await this.waitForCondition(
      async () => {
        const shellVisible = await this.page
          .locator(sapCommonLocators.shellHeader)
          .first()
          .isVisible()
          .catch(() => false);

        const busyVisible = await this.page
          .locator(sapCommonLocators.shellBusyIndicators)
          .first()
          .isVisible()
          .catch(() => false);

        return shellVisible && !busyVisible;
      },
      {
        timeoutMs,
        intervalMs: 500,
        message: 'Fiori shell did not reach ready state',
      },
    );
  }

  /**
   * Example safe interaction entrypoint for Fiori actions.
   * Ensures shell readiness and retries transient click failures.
   */
  protected async clickWhenFioriReady(selector: string): Promise<void> {
    await this.waitForShellLoaded();
    await this.retryWithBackoff(
      async () => {
        await this.page.locator(selector).first().click({ timeout: 15000 });
      },
      { operationName: `Click Fiori element (${selector})` },
    );
  }

  // Example locator (replace with real selectors):
  // private get tile(): Locator {
  //   return this.page.locator(`[role='button'][title='My Tile']`);
  // }
}
