import { BasePage } from './base.page';

/**
 * SapPage — actions for the SAP GUI/Web application.
 *
 * SAP is launched through the iAdaptive portal (see app-registry.ts), so this
 * class does NOT own a login flow — the generic login step handles that and binds
 * the opened popup to this page object via PageProvider.bind().
 *
 * Add page actions as business methods. Co-locate locators as private getters,
 * following the SFDC page object as the reference.
 */
export class SapPage extends BasePage {
  // Example locator (replace with real selectors):
  // private get transactionField(): Locator {
  //   return this.page.locator(`#okcode`);
  // }
}
