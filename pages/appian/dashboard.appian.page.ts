import { BasePage } from '../../core/shared/base.page';

export class AppianDashboardPage extends BasePage {
  // Selectors
  private readonly taskList = this.page.locator('[data-testid="task-list"]');

  async navigate(): Promise<void> {
    // TODO: update with actual Appian dashboard URL path
    await super.navigate('/dashboard');
  }

  async isTaskListVisible(): Promise<boolean> {
    // TODO: update with actual task list selector
    return this.taskList.isVisible();
  }
}
