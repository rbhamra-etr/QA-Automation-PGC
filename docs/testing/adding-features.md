# Adding Features

## Step-by-step

1. Pick the correct subfolder under `features/` for the system under test:
   `sfdc` · `web` · `appian` · `sap` · `fiori` · `api` · `iadaptive` · `e2e`
   Cross-system flows belong in `e2e/`.

2. Name the file descriptively: `<area>.<system>.feature`
   Examples: `payment.sap.feature`, `login.web.feature`

3. Add a system tag at the Feature level: `@sfdc`, `@web`, `@sap`, `@appian`, `@api`, etc.
   Every scenario needs at least one of: `@smoke` `@regression` `@positive` `@negative` `@access`.
   API scenarios must also carry `@api`.

4. Write steps following the Universal Step Format:
   - Actor first (`User`)
   - One action per step — never combine two actions
   - Page name always last: `on the <PageName> page`
   - Example: `User clicks the Submit button on the Make a Payment page`

5. Reuse existing step definitions — check `step-definitions/<system>/` first.

6. If a new step is needed:
   - Add it to the correct `step-definitions/<system>/` file
   - Keep the step thin — call a page method, no logic in steps

7. If a new page action is needed:
   - Add it to the correct `pages/<system>/` page class
   - Locators are `private get` `Locator` properties on the page class
   - No raw selectors in step files

8. Register new page objects in `core/fixtures/page-provider.fixture.ts`.

9. Run tests: `npm run test:<system>` or `npm run test:smoke`.
