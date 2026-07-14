# Adding Features

## Step-by-step

1. Pick the correct module folder for the system under test:
   `functionalities/request-fastners/features/` · `functionalities/web-login-validation/features/` · `functionalities/toll-calculator-apis/features/`
   Cross-cutting reusable steps belong in `functionalities/common/step-definitions/`.

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

5. Reuse existing step definitions — check `functionalities/common/step-definitions/` and the target module `functionalities/<module>/step-definitions/` first.

6. If a new step is needed:
   - Add it to the correct `functionalities/<module>/step-definitions/` file
   - Keep the step thin — call a page method, no logic in steps

7. If a new page action is needed:
   - Add it to the correct `shared/apps/<system>/` page class
   - Locators are `private get` `Locator` properties on the page class
   - No raw selectors in step files

8. Register new page objects in `shared/core/fixtures/page-provider.fixture.ts`.

9. Run tests: `npm run test:<system>` or `npm run test:smoke`.
