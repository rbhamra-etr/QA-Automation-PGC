import { BasePage } from '../../core/shared/base.page';

export class SfdcCasePage extends BasePage {
  // Selectors
  private readonly caseListView = this.page.locator('[data-testid="case-list"]');
  private readonly searchInput = this.page.locator('[placeholder="Search..."]');

  async navigate(): Promise<void> {
    // TODO: update with actual SFDC cases URL path
    await super.navigate('/lightning/o/Case/list');
  }

  async isCaseListVisible(): Promise<boolean> {
    // TODO: update with actual case list selector
    return this.caseListView.isVisible();
  }

  async searchAccount(accountName: string): Promise<void> {
    // TODO: implement actual SFDC account search
    await this.searchInput.fill(accountName);
    await this.searchInput.press('Enter');
  }
}
