import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { SfdcUserListPage } from '../../pages/sfdc/user-list.sfdc.page';
import { test } from '../../core/fixtures/test.fixture';

const { Given, When, Then } = createBdd(test);

Given('User is on SFDC home page on Page Home of SFDC', async ({ page }) => {
  const sfdcUserListPage = new SfdcUserListPage(page);
  await sfdcUserListPage.navigateToSfdcHome();
});

Then('User should see SFDC home page on Page Home of SFDC', async ({ page, context }) => {
  for (const candidatePage of [...context.pages()].reverse()) {
    const sfdcCandidate = new SfdcUserListPage(candidatePage);
    if (await sfdcCandidate.isHomeVisible()) {
      await candidatePage.bringToFront().catch(() => undefined);
      await expect(true).toBeTruthy();
      return;
    }
  }
  const sfdcUserListPage = new SfdcUserListPage(page);
  await expect(await sfdcUserListPage.isHomeVisible()).toBeTruthy();
});

When('User clicks the setup gear icon on Page Home of SFDC', async ({ page, context }) => {
  const sfdcUserListPage = new SfdcUserListPage(page);
  await sfdcUserListPage.clickSetupGearIcon();

  // Setup frequently opens in a new tab. Continue on the newest page.
  const contextPages = context.pages();
  const activePage = contextPages[contextPages.length - 1] ?? page;
  await activePage.bringToFront().catch(() => undefined);
});

When('User clicks Users item from left navigation on Page Setup Home of SFDC', async ({ page }) => {
  const sfdcUserListPage = new SfdcUserListPage(page);
  await sfdcUserListPage.clickUsersLeftNavigationItem();
});

When(
  'User clicks Users link under Administration section in left navigation on Page Setup Home of SFDC',
  async ({ page }) => {
    const sfdcUserListPage = new SfdcUserListPage(page);
    await sfdcUserListPage.clickUsersLinkUnderAdministration();
  }
);

When('User clicks user list dropdown on Page Setup Home of SFDC', async ({ page }) => {
  const sfdcUserListPage = new SfdcUserListPage(page);
  await sfdcUserListPage.clickUserListDropdown();
});

When('User selects All Users from list on Page Setup Home of SFDC', async ({ page }) => {
  const sfdcUserListPage = new SfdcUserListPage(page);
  await sfdcUserListPage.selectAllUsersFromList();
});

Then('User should see All Users view on Page Setup Home of SFDC', async ({ page }) => {
  const sfdcUserListPage = new SfdcUserListPage(page);
  await expect(await sfdcUserListPage.isAllUsersViewVisible()).toBeTruthy();
});

Then('User should see list of all users on Page Setup Home of SFDC', async ({ page }) => {
  const sfdcUserListPage = new SfdcUserListPage(page);
  await expect(await sfdcUserListPage.isAllUsersListVisible()).toBeTruthy();
});

