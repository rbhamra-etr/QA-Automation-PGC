import { createBdd } from 'playwright-bdd';
import { test } from '../../core/fixtures/test.fixture';

const { Then } = createBdd(test);

Then('I should be redirected to the home page', async ({ pages }) => {
  await pages.web.verifyRedirectedToHomePage();
});

Then('I should see my account dashboard', async ({ pages }) => {
  await pages.web.verifyDashboardVisible();
});

Then('I should remain on the login page', async ({ pages }) => {
  await pages.web.verifyStillOnLoginPage();
});

Then('I should see a login error message', async ({ pages }) => {
  await pages.web.verifyLoginErrorMessage();
});
