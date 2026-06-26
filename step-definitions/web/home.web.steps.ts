import { createBdd } from 'playwright-bdd';
import { test } from '../../core/fixtures/test.fixture';

const { Given, When, Then } = createBdd(test);

Given('User navigates to Home on Home page of Web', async ({}) => {
  // TODO: implement navigation
});

Then('User should see home page on Home page of Web', async ({}) => {
  // TODO: implement assertion
});

Given('User is logged in on Login page of Web', async ({}) => {
  // TODO: implement login
});

When('User navigates to account settings on Account Settings page of Web', async ({}) => {
  // TODO: implement navigation
});

Then('User should see account details on Account Settings page of Web', async ({}) => {
  // TODO: implement assertion
});
