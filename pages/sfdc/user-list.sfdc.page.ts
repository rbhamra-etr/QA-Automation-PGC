import { BasePage } from '../../core/shared/base.page';
import { ENV } from '../../core/configs/env.config';

type DomButtonLike = {
  getAttribute(name: string): string | null;
  textContent: string | null;
  clientHeight: number;
  scrollIntoView(options?: unknown): void;
  click(): void;
};

type DomRuntimeLike = {
  document: {
    querySelectorAll(selector: string): Iterable<unknown>;
  };
  getComputedStyle(node: unknown): { visibility: string; display: string };
};

export class SfdcUserListPage extends BasePage {
  // Selectors
  private readonly globalSearchInput = this.page.getByRole('searchbox', {
    name: /search salesforce/i,
  });
  private readonly appHeader = this.page.locator('header, [role="banner"]');
  private readonly appLauncherOrSetupAnchor = this.page.locator(
    '[aria-label*="App Launcher" i], button[aria-label*="Setup" i]'
  );
  private readonly setupGearIcon = this.page.getByRole('button', { name: /^setup$/i });
  private readonly setupMenuEntry = this.page
    .locator('[role="menuitem"]:has-text("Setup")')
    .first();
  private readonly setupMenu = this.page.locator(
    '[role="menu"]:has-text("Setup"), [role="menu"]:has-text("Setup Menu")'
  );
  private readonly usersLeftNavigationItem = this.page.locator(
    '[role="treeitem"]:has-text("Users") button[title*="Expand" i], [role="treeitem"]:has-text("Users") button[aria-label*="Expand" i], [role="treeitem"]:has-text("Users") button'
  );
  private readonly usersLinkUnderAdministration = this.page.locator(
    '[role="tree"] a[href*="ManageUsersLightning"], [role="tree"] a:has-text("Users"), a[href*="ManageUsersLightning"]'
  );
  private readonly allUsersOption = this.page.locator(
    '[role="option"]:has-text("All Users"), [role="menuitem"]:has-text("All Users"), :text("All Users")'
  );
  private readonly allUsersViewLabel = this.page.locator(
    'h1:has-text("All Users"), [role="status"]:has-text("All Users")'
  );
  private readonly usersListTable = this.page.locator(
    '[role="grid"], table:has(th:has-text("Full Name")), table:has(th:has-text("Username"))'
  );

  private resolveSfdcTimeout(timeoutMs?: number): number {
    return this.resolveTimeout(timeoutMs, ENV.SFDC_TIMEOUT_MS);
  }

  private resolveSfdcRetries(retries?: number): number {
    return this.resolveRetries(retries, ENV.SFDC_RETRY_COUNT);
  }

  private async scrollSetupTreeUntilVisible(
    target: ReturnType<typeof this.page.locator>,
    timeoutMs: number
  ): Promise<boolean> {
    const deadline = Date.now() + Math.min(timeoutMs, 15000);
    const setupTree = this.page.locator('[role="tree"]').first();

    while (Date.now() < deadline) {
      if (
        await target
          .first()
          .isVisible({ timeout: 500 })
          .catch(() => false)
      ) {
        return true;
      }

      const hasTree = await setupTree.isVisible({ timeout: 500 }).catch(() => false);
      if (hasTree) {
        await setupTree.evaluate((node) => {
          const element = node as unknown as { scrollTop: number; scrollHeight: number };
          element.scrollTop = Math.min(element.scrollTop + 600, element.scrollHeight);
        });
      } else {
        await this.page.mouse.wheel(0, 700);
      }

      await this.page.waitForTimeout(250);
    }

    return target
      .first()
      .isVisible({ timeout: 500 })
      .catch(() => false);
  }

  async navigateToSfdcHome(timeoutMs?: number): Promise<void> {
    const timeout = this.resolveSfdcTimeout(timeoutMs);
    if (!ENV.SFDC_RUN_URL) {
      throw new Error('SFDC_RUN_URL is not configured. Set it in your .env file.');
    }
    await this.page.goto(ENV.SFDC_RUN_URL, { waitUntil: 'domcontentloaded', timeout });
    await this.page.waitForURL(/salesforce\.com|force\.com/i, { timeout }).catch(() => undefined);
  }

  async isHomeVisible(): Promise<boolean> {
    const timeout = this.resolveSfdcTimeout();

    try {
      await this.page.waitForURL(/salesforce\.com|force\.com/i, { timeout }).catch(() => undefined);
      await this.page.waitForLoadState('domcontentloaded');

      const onSalesforceHost = /salesforce\.com|force\.com/i.test(this.page.url());
      if (!onSalesforceHost) {
        return false;
      }

      const currentUrl = this.page.url();
      const hasSfdcHomeUrl = /\/lightning\/page\/home|\/one\/one\.app/i.test(currentUrl);
      if (hasSfdcHomeUrl) {
        return true;
      }

      const pageTitle = await this.page.title().catch(() => '');
      if (/salesforce/i.test(pageTitle)) {
        return true;
      }

      const hasGlobalSearch = await this.globalSearchInput
        .first()
        .isVisible({ timeout })
        .catch(() => false);
      if (hasGlobalSearch) {
        return true;
      }

      const hasSetupAnchor = await this.appLauncherOrSetupAnchor
        .first()
        .isVisible({ timeout })
        .catch(() => false);
      if (hasSetupAnchor) {
        return true;
      }

      const hasHeader = await this.appHeader
        .first()
        .isVisible({ timeout: Math.min(timeout, 8000) })
        .catch(() => false);
      return hasHeader;
    } catch {
      return false;
    }
  }

  async clickSetupGearIcon(timeoutMs?: number, retries?: number): Promise<void> {
    const timeout = this.resolveSfdcTimeout(timeoutMs);
    const attempts = this.resolveSfdcRetries(retries);
    await this.retryAction(
      'Click SFDC setup gear icon',
      async () => {
        await this.setupGearIcon.first().waitFor({ state: 'visible', timeout });
        await this.setupGearIcon.first().click({ timeout });

        await this.setupMenu
          .first()
          .waitFor({ state: 'visible', timeout: Math.min(timeout, 10000) })
          .catch(() => undefined);

        if (await this.setupMenuEntry.isVisible({ timeout: 2000 }).catch(() => false)) {
          await this.setupMenuEntry.click({ timeout: Math.min(timeout, 10000) });
        }

        await this.page
          .waitForURL(/\/lightning\/setup\//i, { timeout: Math.min(timeout, 10000) })
          .catch(async () => {
            const setupHomeUrl = `${this.page.url().split('/lightning/')[0]}/lightning/setup/SetupOneHome/home`;
            await this.page.goto(setupHomeUrl, { waitUntil: 'domcontentloaded', timeout });
          });
      },
      attempts
    );
  }

  async clickUsersLeftNavigationItem(timeoutMs?: number, retries?: number): Promise<void> {
    const timeout = this.resolveSfdcTimeout(timeoutMs);
    const attempts = this.resolveSfdcRetries(retries);
    await this.retryAction(
      'Expand Users in SFDC setup navigation',
      async () => {
        if (
          await this.usersLinkUnderAdministration
            .first()
            .isVisible({ timeout: 2000 })
            .catch(() => false)
        ) {
          return;
        }

        await this.page.waitForURL(/\/lightning\/setup\//i, { timeout }).catch(() => undefined);
        await this.scrollSetupTreeUntilVisible(this.usersLeftNavigationItem, timeout);

        const candidates = [
          this.usersLeftNavigationItem.first(),
          this.page.getByRole('button', { name: /expand.*users|users.*expand/i }).first(),
          this.page.locator('[role="treeitem"]:has-text("Users")').first(),
        ];

        for (const candidate of candidates) {
          if (await candidate.isVisible({ timeout: 2500 }).catch(() => false)) {
            await candidate.scrollIntoViewIfNeeded().catch(() => undefined);
            await candidate.click({ timeout: Math.min(timeout, 10000), force: true });
            if (
              await this.usersLinkUnderAdministration
                .first()
                .isVisible({ timeout: 3000 })
                .catch(() => false)
            ) {
              return;
            }
          }
        }

        throw new Error('Users node/link not reachable in SFDC setup left navigation.');
      },
      attempts
    );
  }

  async clickUsersLinkUnderAdministration(timeoutMs?: number, retries?: number): Promise<void> {
    const timeout = this.resolveSfdcTimeout(timeoutMs);
    const attempts = this.resolveSfdcRetries(retries);
    await this.retryAction(
      'Click Users link under Administration in SFDC setup',
      async () => {
        await this.scrollSetupTreeUntilVisible(this.usersLinkUnderAdministration, timeout);
        await this.usersLinkUnderAdministration.first().waitFor({ state: 'visible', timeout });
        await this.usersLinkUnderAdministration
          .first()
          .scrollIntoViewIfNeeded()
          .catch(() => undefined);
        await this.usersLinkUnderAdministration.first().click({ timeout });
        await this.page
          .waitForURL(/ManageUsersLightning/i, { timeout: Math.min(timeout, 15000) })
          .catch(() => undefined);
      },
      attempts
    );
  }

  async clickUserListDropdown(timeoutMs?: number, retries?: number): Promise<void> {
    const timeout = this.resolveSfdcTimeout(timeoutMs);
    const attempts = this.resolveSfdcRetries(retries);
    await this.retryAction(
      'Open SFDC user list dropdown',
      async () => {
        if (!/ManageUsersLightning/i.test(this.page.url())) {
          const setupBase = `${this.page.url().split('/lightning/')[0]}/lightning/setup/ManageUsersLightning/home`;
          await this.page.goto(setupBase, { waitUntil: 'domcontentloaded', timeout });
        }

        await this.page.waitForURL(/ManageUsersLightning/i, { timeout: Math.min(timeout, 15000) }).catch(() => undefined);
        await this.page.waitForLoadState('domcontentloaded');

        const primaryCandidates = [
          this.page.locator('button[title*="Select a List View" i]:visible').first(),
          this.page.locator('button[title*="List View" i]:visible').first(),
          this.page
            .getByRole('button', {
              name: /select a list view|list view|all users|recently viewed/i,
            })
            .first(),
          this.page.locator('button[aria-haspopup="listbox"]').first(),
        ];

        for (const candidate of primaryCandidates) {
          if (await candidate.isVisible({ timeout: 4000 }).catch(() => false)) {
            await candidate.scrollIntoViewIfNeeded().catch(() => undefined);
            await candidate.click({ timeout: Math.min(timeout, 10000), force: true });
            return;
          }
        }

        // Fallback: detect and click a likely list-view trigger by title/text directly in DOM.
        await this.page
          .waitForFunction(() => {
            const dom = globalThis as unknown as DomRuntimeLike;
            const buttons = Array.from(dom.document.querySelectorAll('button')).filter(
              (node): node is DomButtonLike => {
                return (
                  typeof node === 'object' &&
                  node !== null &&
                  'getAttribute' in node &&
                  'textContent' in node &&
                  'clientHeight' in node
                );
              }
            );

            return buttons.some((button) => {
              const title = (button.getAttribute('title') ?? '').toLowerCase();
              const aria = (button.getAttribute('aria-label') ?? '').toLowerCase();
              const text = (button.textContent ?? '').toLowerCase();
              const matches =
                title.includes('select a list view') ||
                title.includes('list view controls') ||
                aria.includes('select a list view') ||
                aria.includes('list view controls') ||
                text.includes('select a list view') ||
                text.includes('list view controls') ||
                text.includes('all users') ||
                text.includes('recently viewed');
              if (!matches) {
                return false;
              }

              const style = dom.getComputedStyle(button);
              const isVisible = style.visibility !== 'hidden' && style.display !== 'none' && button.clientHeight > 0;
              return isVisible;
            });
          }, { timeout: Math.min(timeout, 15000) })
          .catch(() => undefined);

        const clickedByDomFallback = await this.page.evaluate(() => {
          const dom = globalThis as unknown as DomRuntimeLike;
          const buttons = Array.from(dom.document.querySelectorAll('button')).filter(
            (node): node is DomButtonLike => {
              return (
                typeof node === 'object' &&
                node !== null &&
                'getAttribute' in node &&
                'textContent' in node &&
                'clientHeight' in node &&
                'scrollIntoView' in node &&
                'click' in node
              );
            }
          );

          const candidates = buttons.filter((button) => {
            const title = (button.getAttribute('title') ?? '').toLowerCase();
            const aria = (button.getAttribute('aria-label') ?? '').toLowerCase();
            const text = (button.textContent ?? '').toLowerCase();
            const matches =
              title.includes('select a list view') ||
              title.includes('list view controls') ||
              aria.includes('select a list view') ||
              aria.includes('list view controls') ||
              text.includes('select a list view') ||
              text.includes('list view controls') ||
              text.includes('all users') ||
              text.includes('recently viewed');
            if (!matches) {
              return false;
            }

            const style = dom.getComputedStyle(button);
            return style.visibility !== 'hidden' && style.display !== 'none' && button.clientHeight > 0;
          });

          const target = candidates[0];
          if (!target) {
            return false;
          }

          target.scrollIntoView({ block: 'center', inline: 'center' });
          target.click();
          return true;
        });

        if (clickedByDomFallback) {
          return;
        }

        throw new Error('User list dropdown is not visible on Manage Users page.');
      },
      attempts
    );
  }

  async selectAllUsersFromList(timeoutMs?: number, retries?: number): Promise<void> {
    const timeout = this.resolveSfdcTimeout(timeoutMs);
    const attempts = this.resolveSfdcRetries(retries);
    await this.retryAction(
      'Select All Users from SFDC list view',
      async () => {
        await this.allUsersOption.first().waitFor({ state: 'visible', timeout });
        await this.allUsersOption.first().click({ timeout });
      },
      attempts
    );
  }

  async isAllUsersViewVisible(timeoutMs?: number): Promise<boolean> {
    try {
      await this.allUsersViewLabel
        .first()
        .waitFor({ state: 'visible', timeout: this.resolveSfdcTimeout(timeoutMs) });
      return true;
    } catch {
      return false;
    }
  }

  async isAllUsersListVisible(timeoutMs?: number): Promise<boolean> {
    try {
      await this.usersListTable
        .first()
        .waitFor({ state: 'visible', timeout: this.resolveSfdcTimeout(timeoutMs) });
      return true;
    } catch {
      return false;
    }
  }
}
