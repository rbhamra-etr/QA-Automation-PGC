import { createBdd } from 'playwright-bdd';
import { test } from '../../core/fixtures/test.fixture';

const { When } = createBdd(test);

When('I search for a Billing Account {string} using Global Search', async ({ pages, session }, baName: string) => {
  session.searchText = baName;
  await pages.sfdc.searchGlobally(baName);
});

When('I search for a Customer {string} using Global Search', async ({ pages, session }, customerName: string) => {
  session.searchText = customerName;
  await pages.sfdc.searchGlobally(customerName);
});

When('I open the Billing Account record', async ({ pages, session }) => {
  const text = session.searchText!;
  await pages.sfdc.openRecordFromResults(text);
  await pages.sfdc.verifyRecordOpened(text);
});

When('I open the Customer record', async ({ pages, session }) => {
  const text = session.searchText!;
  await pages.sfdc.openRecordFromResults(text);
  await pages.sfdc.verifyRecordOpened(text);
});

When('I click the {string} tab or dropdown', async ({ pages }, tabName: string) => {
  if (tabName.trim().toLowerCase() !== 'requests') {
    throw new Error(`This framework currently supports only 'Requests' here. Received '${tabName}'.`);
  }

  await pages.sfdc.openRequestsMenu();
});