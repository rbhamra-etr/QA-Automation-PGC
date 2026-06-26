import { BasePage } from './base.page';

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
  // Example locator (replace with real selectors):
  // private get tile(): Locator {
  //   return this.page.locator(`[role='button'][title='My Tile']`);
  // }
}
