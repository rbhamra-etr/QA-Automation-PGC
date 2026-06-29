import { createBdd } from 'playwright-bdd';
import { getUserCredentials } from '../../core/configs/env.config';
import { getUiApp, resolveStandaloneUrl } from '../../core/configs/app-registry.config';
import { test } from '../../core/fixtures/test.fixture';

const { Given, When } = createBdd(test);

Given('I am on the 407ETR login page', async ({ pages }) => {
  const webApp = getUiApp('Web');
  await pages.web.openLoginPage(resolveStandaloneUrl(webApp));
});

When('I enter credentials for {string}', async ({ pages }, credentialKey: string) => {
  const { username, password } = getUserCredentials('Web', credentialKey);
  await pages.web.enterCredentials(username, password);
});

When('I click the login button', async ({ pages }) => {
  await pages.web.clickLoginButton();
});

When('I sign in to 407ETR using credential key {string}', async ({ pages }, credentialKey: string) => {
  const { username, password } = getUserCredentials('Web', credentialKey);
  await pages.web.enterCredentials(username, password);
  await pages.web.clickLoginButton();
});

When('I sign in to 407ETR using {string} and password {string}', async ({ pages }, username: string, password: string) => {
  //const { username, password } = getUserCredentials('Web', credentialKey);
  await pages.web.enterCredentials(username, password);
  await pages.web.clickLoginButton();
});

When('I sign in to 407ETR using user ID {string}', async ({ pages }, userId: string) => {
  const sharedPassword = process.env.WEB_SHARED_PASSWORD?.trim();

  if (!sharedPassword) {
    throw new Error(
      'Missing WEB_SHARED_PASSWORD environment variable. Set WEB_SHARED_PASSWORD in .env.qa or .env.uat.',
    );
  }

  await pages.web.enterCredentials(userId, sharedPassword);
  await pages.web.clickLoginButton();
});
