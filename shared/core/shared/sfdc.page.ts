import { expect, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { sfdcCommonLocators } from '../../apps/sfdc/locators/common.locators';

export class SfdcPage extends BasePage {
  /**
   * Wait for Salesforce shell to be interactable.
   * Uses broad selectors so all SFDC page objects can reuse it safely.
   */
  protected async waitForShellLoaded(timeoutMs = 30000): Promise<void> {
    await this.waitForCondition(
      async () => {
        const headerVisible = await this.page
          .locator(sfdcCommonLocators.shellHeader)
          .first()
          .isVisible()
          .catch(() => false);

        const spinnerVisible = await this.page
          .locator(sfdcCommonLocators.shellBusyIndicators)
          .first()
          .isVisible()
          .catch(() => false);

        return headerVisible && !spinnerVisible;
      },
      {
        timeoutMs,
        intervalMs: 500,
        message: 'SFDC shell did not reach ready state',
      },
    );
  }

  // ── Locators (co-located) ─────────────────────────────────────────────────
  // Getters re-read `this.page` on every access, so they stay correct even after
  // the SFDC login step swaps the page to the popup via switchToPage().

  /** The search button that enables the input field */
  private get searchButton(): Locator {
    return this.page.locator(`button.search-button[aria-label='Search']`);
  }
  /** The search input that appears after clicking the search button */
  private get globalSearchInput(): Locator {
    return this.page.locator(`input[type='search'][placeholder='Search...']`);
  }
  /** Link in search results matching a specific record text */
  private searchResultLink(text: string): Locator {
    return this.page.locator(`a[data-refid='recordId'][title='${text}']`);
  }
  /** Record header h1 — contains entity label + primary field value */
  private get recordHeaderTitle(): Locator {
    return this.page.locator(`h1 slot[name='primaryField'] lightning-formatted-text`);
  }
  /** "Close All" button that appears after pressing Shift+W */
  private get closeAllButton(): Locator {
    return this.page.locator(`button.slds-button_brand:has-text('Close All')`);
  }
  /** Requests tab link */
  private get requestsTab(): Locator {
    return this.page.locator(`a[data-label='Requests'][role='tab']`);
  }
  /** Process name dropdown input (visible after Requests tab is clicked) */
  private get processNameInput(): Locator {
    return this.page.locator(`input[name='processNameDropdown']`);
  }
  /** e.g. requestOption('Request Fasteners') */
  private requestOption(optionName: string): Locator {
    return this.page.locator(
      `lightning-base-combobox-item[data-value='${optionName}'], [role='option']:has-text('${optionName}')`,
    );
  }

  async closeAllTabs(): Promise<void> {
    await this.page.keyboard.press('Shift+W');
    const closeAllBtn = this.closeAllButton;
    await closeAllBtn.waitFor({ state: 'visible', timeout: 15000 });
    await closeAllBtn.click();
  }

  async searchGlobally(searchText: string): Promise<void> {
    await this.waitForShellLoaded();

    // Close any active tabs before searching
    await this.closeAllTabs();
    // Click the search button to activate the input
    await this.retryWithBackoff(
      async () => {
        await this.searchButton.click({ timeout: 20000 });
      },
      { operationName: 'Click SFDC global search button' },
    );
    // Fill the now-active search input and submit
    const input = this.globalSearchInput;
    await input.waitFor({ state: 'visible', timeout: 10000 });
    await input.fill(searchText);
    await this.page.keyboard.press('Enter');
  }

  async openRecordFromResults(recordText: string): Promise<void> {
    const link = this.searchResultLink(recordText).first();
    await link.waitFor({ state: 'visible', timeout: 20000 });
    await this.retryWithBackoff(
      async () => {
        await link.click();
      },
      { operationName: `Open SFDC record from results (${recordText})` },
    );
  }

  async verifyRecordOpened(expectedText: string): Promise<void> {
    const header = this.recordHeaderTitle;
    await expect(header).toHaveText(expectedText, { timeout: 20000 });
  }

  async openRequestsMenu(): Promise<void> {
    await this.waitForShellLoaded();

    // Click the Requests tab
    await this.retryWithBackoff(
      async () => {
        await this.requestsTab.click({ timeout: 20000 });
      },
      { operationName: 'Open SFDC Requests tab' },
    );
    // Wait for the process name dropdown input to appear
    const input = this.processNameInput;
    await input.waitFor({ state: 'visible', timeout: 15000 });
    // Click inside the input to open the dropdown list
    await input.click();
  }

  async shouldSeeRequestOption(optionName: string): Promise<void> {
    await expect(this.requestOption(optionName).first()).toBeVisible({ timeout: 15000 });
  }

  async shouldNotSeeRequestOption(optionName: string): Promise<void> {
    await expect(this.requestOption(optionName).first()).toHaveCount(0);
  }

  async selectRequestOption(optionName: string): Promise<void> {
    await this.requestOption(optionName).first().click({ timeout: 15000 });
  }
}
