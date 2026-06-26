import { BasePage } from './base.page';

/**
 * AppianPage — actions for the Appian application.
 *
 * Appian is launched through the iAdaptive portal (see app-registry.ts), so this
 * class does NOT own a login flow — the generic login step handles that and binds
 * the opened popup to this page object via PageProvider.bind().
 *
 * Add page actions as business methods (e.g. submitForm, openTask). Co-locate
 * locators as private getters, following the SFDC page object as the reference.
 */
export class AppianPage extends BasePage {
  // Example locator (replace with real selectors):
  // private get someButton(): Locator {
  //   return this.page.locator(`button:has-text('Submit')`);
  // }

  // Example action:
  // async submitForm(): Promise<void> {
  //   await this.someButton.click();
  // }
}
