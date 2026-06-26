import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { IAdaptiveHomePage } from '../../pages/iadaptive/home.iadaptive.page';
import { test } from '../../core/fixtures/test.fixture';

const { Given, When, Then } = createBdd(test);

Given('User navigates to Home on Page Home of IAdaptive', async ({ page }) => {
  const iadaptiveHomePage = new IAdaptiveHomePage(page);
  await iadaptiveHomePage.navigate();
});

Then('User should see home page on Page Home of IAdaptive', async ({ page }) => {
  const iadaptiveHomePage = new IAdaptiveHomePage(page);
  await expect(await iadaptiveHomePage.isAccessPageVisible()).toBeTruthy();
});

Given('User navigates to IAdaptive access portal on Page Access of IAdaptive', async ({ page }) => {
  const iadaptiveHomePage = new IAdaptiveHomePage(page);
  await iadaptiveHomePage.navigateToAccessPortal();
  await expect(await iadaptiveHomePage.isAccessPageVisible()).toBeTruthy();
});

When('User closes modal if visible on Page Access of IAdaptive', async ({ page }) => {
  const iadaptiveHomePage = new IAdaptiveHomePage(page);
  await iadaptiveHomePage.closeModalIfVisible();
});

When('User launches SFDC application from app tiles on Page Access of IAdaptive', async ({ page, context }) => {
  const iadaptiveHomePage = new IAdaptiveHomePage(page);
  await iadaptiveHomePage.launchSfdcApp();

  // IAdaptive can open SFDC in a new tab. Always continue with the most recently opened page.
  const contextPages = context.pages();
  const activePage = contextPages[contextPages.length - 1] ?? page;
  await activePage.bringToFront().catch(() => undefined);
});
