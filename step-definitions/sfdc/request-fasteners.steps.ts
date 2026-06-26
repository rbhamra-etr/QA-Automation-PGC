import { createBdd } from 'playwright-bdd';
import { test } from '../../core/fixtures/test.fixture';

const { When, Then } = createBdd(test);

Then('I should see {string} in the Requests options', async ({ pages }, optionName: string) => {
  await pages.sfdc.shouldSeeRequestOption(optionName);
});

Then('I should not see {string} in the Requests options', async ({ pages }, optionName: string) => {
  await pages.sfdc.shouldNotSeeRequestOption(optionName);
});
