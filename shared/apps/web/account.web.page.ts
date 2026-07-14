import { BasePage } from '../../core/shared/base.page';

export class WebAccountPage extends BasePage {
  // Selectors
  private readonly accountDetailsSection = this.page.locator('[data-testid="account-details"]');

  async navigate(): Promise<void> {
    // TODO: update with actual account settings URL path
    await super.navigate('/account/settings');
  }

  async isAccountDetailsDisplayed(): Promise<boolean> {
    // TODO: update with actual account details selector
    return this.accountDetailsSection.isVisible();
  }
}
