import { createBdd } from 'playwright-bdd';
import { test } from '../../core/fixtures/test.fixture';

const { Given, When, Then } = createBdd(test);

Given('User is logged in on Login page of SFDC', async ({}) => {
  // TODO: implement Salesforce login
});

When('User navigates to Cases list view on Cases page of SFDC', async ({}) => {
  // TODO: implement navigation
});

Then('User should see open cases on Cases page of SFDC', async ({}) => {
  // TODO: implement assertion
});

When('User searches for account {string} on Account Search page of SFDC', async ({}, _accountName: string) => {
  // TODO: implement account search
});

Then('User should see account record on Account page of SFDC', async ({}) => {
  // TODO: implement assertion
});

