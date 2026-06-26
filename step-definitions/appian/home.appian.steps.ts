import { createBdd } from 'playwright-bdd';
import { test } from '../../core/fixtures/test.fixture';

const { Given, When, Then } = createBdd(test);

Given('User navigates to Home on Home page of Appian', async ({}) => {
  // TODO: implement navigation
});

Then('User should see home page on Home page of Appian', async ({}) => {
  // TODO: implement assertion
});

Given('User is logged in on Login page of Appian', async ({}) => {
  // TODO: implement login
});

When('User navigates to Dashboard on Dashboard page of Appian', async ({}) => {
  // TODO: implement navigation
});

Then('User should see task list on Dashboard page of Appian', async ({}) => {
  // TODO: implement assertion
});
