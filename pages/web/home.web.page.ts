import { BasePage } from '../../core/shared/base.page';

export class WebHomePage extends BasePage {
  // Selectors
  private readonly pageHeader = this.page.locator('h1');

  async navigate(): Promise<void> {
    // TODO: update with actual web home URL path
    await super.navigate();
  }

  async isDisplayed(): Promise<boolean> {
    // TODO: update with actual element that confirms the page is loaded
    return this.pageHeader.isVisible();
  }
}
