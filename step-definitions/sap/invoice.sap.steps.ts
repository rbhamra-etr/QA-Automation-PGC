import { createBdd } from 'playwright-bdd';
import { test } from '../../core/fixtures/test.fixture';

const { Given, When, Then } = createBdd(test);

Given('User is logged in on Login page of SAP', async ({}) => {
  // TODO: implement SAP login
});

When('User navigates to Invoice Processing on Invoice page of SAP', async ({}) => {
  // TODO: implement navigation
});

Then('User should see pending invoices on Invoice page of SAP', async ({}) => {
  // TODO: implement assertion
});

When('User navigates to Payment Processing on Payment page of SAP', async ({}) => {
  // TODO: implement navigation
});

Then('User should be able to post a new payment on Payment page of SAP', async ({}) => {
  // TODO: implement assertion
});
