# Playwright BDD Framework

Team automation framework built on **Playwright** + **playwright-bdd** (Gherkin/Cucumber syntax).
Tests **five systems from one project**: SFDC, Web, Appian, SAP Fiori, and APIs.

> **New here?** Read [.github/copilot-instructions.md](.github/copilot-instructions.md) for the architecture and how to extend it.

## Key Features

- **BDD / Gherkin** — write tests in plain English `.feature` files
- **Page Object Model (POM)** — business actions live in page classes, not in steps
- **Layered architecture** — `core` (engine) · `pages` (UI pages) · `step-definitions` (BDD steps) · `data` (test data)
- **One registry to rule them all** — add a system by editing `core/configs/app-registry.config.ts`
- **Generic login** — one step logs into any system (portal or standalone)
- **Reusable API client** — generic HTTP with 429 retry + report attachments; any API plugs in
- **Pre-built action library** — `BasePage` ships 50+ ready-to-use methods
- **Multi-environment support** — QA and UAT environments via `.env.qa` / `.env.uat`
- **Role-based credentials** — derived automatically from the role name; no mapping file needed

---

## Folder Structure

```
features/                          # Gherkin specs, one subfolder per system
  sfdc/ web/ appian/ fiori/ sap/ api/ iadaptive/ e2e/
  billings/ promotions/ request-fastners/

core/                              # Framework engine (app-agnostic, rarely changes)
  configs/
    app-registry.config.ts         # ⭐ SINGLE SOURCE OF TRUTH: all apps + APIs + lookup functions
  consts/
    app-registry.const.ts          # UI_APPS and API_SERVICES data arrays
    browser.const.ts               # Chrome launch args + auth headers to strip
    toll-rate.const.ts             # Zone definitions + statutory holidays
  models/
    api-context.model.ts           # ApiContext interface
    app-registry.model.ts          # UiAppConfig, ApiServiceConfig interfaces
    base-api.model.ts              # ApiResult, RequestOptions interfaces
    toll-rate.model.ts             # ExpectedZone interface
  types/
    app-registry.type.ts           # LaunchMode type
    browser.type.ts                # BrowserSession type
  factories/
    browser.factory.ts             # Incognito Chrome launcher + cleanup
  fixtures/
    test.fixture.ts                # BDD fixtures: page, iadaptivePage, pages, session
    page-provider.fixture.ts       # Lazy page-object registry (register new UI pages here)
  helpers/
    toll-rate.helper.ts            # Zone, day-type, time-band, direction resolvers
  utils/
    date.util.ts                   # Date helpers
    logger.util.ts                 # Structured logger
    test-data.util.ts              # Test data loader helpers
  shared/
    base.page.ts                   # 50+ pre-built UI actions — extend in every page class
    base.api.ts                    # Generic HTTP client (429 retry, report attach)
    iadaptive.page.ts              # IAdaptive login gateway page
    sfdc.page.ts / web.page.ts     # App-specific page base classes
    appian.page.ts / sap.page.ts / fiori.page.ts

pages/                             # Page object classes, one subfolder per system
  base.page.ts                     # Re-exported from core/shared
  sfdc/  web/  appian/  sap/  iadaptive/

step-definitions/                  # BDD step implementations, one subfolder per system
  api/
    common.api.steps.ts            # Generic API steps (any service)
    context.api.ts                 # Shared per-scenario API state
    toll-rate.api.steps.ts         # Toll-specific request + assertion steps
  sfdc/  web/  appian/  sap/  iadaptive/  e2e/

data/                              # Test data (CSV files, rate charts, reference tables)
  api/  sfdc/

docs/                              # Documentation
support/                           # Legacy support files (not active)
scripts/                           # Report generation + Xray upload scripts

.env.qa                            # QA credentials (gitignored)
.env.uat                           # UAT credentials (gitignored)
.env.example                       # Credential template — copy to .env.qa or .env.uat
playwright.config.ts               # Playwright + BDD configuration
tsconfig.json                      # TypeScript compiler settings
```

> **Per-system layout convention**
> - `pages/<system>/` — page objects (one class per screen), locators co-located as `private get` `Locator` getters.
> - `step-definitions/<system>/` — step files per feature area. Thin wrappers that call page methods.
> - `data/` — module-specific test data / reference tables.

---

## Setup

**1. Install dependencies**

```bash
npm install
```

**2. Create your environment credential files**

```bash
copy .env.example .env.qa    # fill in QA values
copy .env.example .env.uat   # fill in UAT values
```

**3. Fill in the values** in `.env.qa` and `.env.uat`:

```env
HEADLESS=false
SLOW_MO=0
DEFAULT_TIMEOUT=30000

IADAPTIVE_ACCESS_URL=https://your-iadaptive-qa.example.com

SFDC_CSR_USERNAME=john.doe@company.com
SFDC_CSR_PASSWORD=secret

WEB_BASE_URL=https://www.qat.example.com
WEB_USERNAME=test.user@example.com
WEB_PASSWORD=secret

TOLL_API_BASE_URL=https://api.qat.example.com

JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=test.user@example.com
JIRA_API_TOKEN=your_token

XRAY_CLIENT_ID=your_client_id
XRAY_CLIENT_SECRET=your_client_secret
```

> Credential key convention:
> - App + Role: `{APP}_{ROLE}_USERNAME` / `{APP}_{ROLE}_PASSWORD`
> - Single-user app: `{APP}_USERNAME` / `{APP}_PASSWORD`
> - Role names are auto-normalised: spaces → `_`, uppercase. e.g. `"Dig Sup Mgr"` → `DIG_SUP_MGR`

---

## Running Tests

### Run all tests

All tests open in a **visible incognito Chrome window** by default (your installed Chrome, no Playwright browser download needed).

| Command | Environment | Browser |
|---|---|---|
| `npm test` | QA (default) | headed Chrome incognito |
| `npm run test:qa` | QA | headed Chrome incognito |
| `npm run test:uat` | UAT | headed Chrome incognito |
| `npm run test:qa:headed` | QA | headed Chrome incognito (explicit) |
| `npm run test:uat:headed` | UAT | headed Chrome incognito (explicit) |
| `npm run test:ui` | — | Playwright interactive UI mode |
| `npm run test:report` | — | Open last HTML report |
| Cucumber JSON output | — | `reports/cucumber/cucumber-report.json` |

---

### Run by system

| Command | System |
|---|---|
| `npm run test:sfdc` | SFDC only |
| `npm run test:web` | Web only |
| `npm run test:appian` | Appian only |
| `npm run test:fiori` | SAP Fiori only |
| `npm run test:sap` | SAP only |
| `npm run test:api` | API tests only (no browser) |
| `npm run test:browser` | All browser tests (no API) |
| `npm run test:e2e` | End-to-end integration tests |

---

### Run by tag

Tags are set in `.feature` files on the `Feature:`, `Scenario:`, or `Scenario Outline:` line.

| Command | Runs |
|---|---|
| `npm run test:smoke` | All `@smoke` scenarios |
| `npm run test:regression` | All `@regression` scenarios |
| `npm run test:positive` | All `@positive` scenarios |
| `npm run test:negative` | All `@negative` scenarios |
| `npm run test:access` | All `@access` scenarios |

**Run any tag ad-hoc:**

```powershell
npm run test:qa:tag -- @regression
npm run test:uat:tag -- @smoke
```

**Combine tags:**

```powershell
# OR — @smoke OR @regression
npm run test:qa:tag -- "@smoke|@regression"

# AND — must have BOTH @access AND @positive
npm run test:qa:tag -- "(?=.*@access)(?=.*@positive)"
```

---

### Run a specific feature file

Generated spec files live in `.features-gen/` and mirror the `features/` folder structure.

```powershell
npm run test:qa:file -- ".features-gen/features/sfdc/account.sfdc.feature.spec.js"
```

---

### Upload Cucumber JSON to Xray

After test execution generates `reports/cucumber/cucumber-report.json`:

```powershell
npm run xray:upload:cucumber
```

---

## How Login Works

Feature files never mention IAdaptive. One step handles everything:

```gherkin
Given I am logged in to SFDC as "CSR"
```

Behind the scenes this:
1. Opens the IAdaptive portal URL from your `.env` file
2. Logs in with the credentials for the `CSR` role
3. Clicks the **SFDC** tile to launch Salesforce

---

## Adding a New Test Case

1. Create a `.feature` file in `features/<system>/` (e.g. `features/sfdc/my-story.sfdc.feature`).
2. Write your scenarios in Gherkin.
3. Run `npm run bdd:gen` — it will print snippets for any steps that don't exist yet.
4. Implement missing steps in `step-definitions/<system>/`.
5. If new page actions are needed, add them to the page class in `pages/<system>/`.

---

## Adding a New Page (POM)

```ts
// pages/my-system/my-screen.my-system.page.ts
import { Locator } from '@playwright/test';
import { BasePage } from '../base.page';

export class MyScreenPage extends BasePage {
  private get submitButton(): Locator {
    return this.page.locator('#submit');
  }

  async submitForm(): Promise<void> {
    await this.submitButton.click();
  }
}
```

Then register the page in `core/fixtures/page-provider.fixture.ts`.

---

## Adding a New System to the Registry

Edit `core/consts/app-registry.const.ts` to add the app entry, then `core/configs/app-registry.config.ts` exposes it automatically.

```ts
// core/consts/app-registry.const.ts
{ key: 'MyApp', label: 'My Application', launch: 'iadaptive', tile: 'My App Tile', tileEnvVar: 'MYAPP_LINK_TEXT' }
```

---

## BasePage — Pre-built Action Methods

Every page class that extends `BasePage` inherits these methods automatically:

| Category | Methods |
|---|---|
| **Locator** | `locate`, `locateAll`, `count` |
| **Mouse** | `click`, `forceClick`, `doubleClick`, `rightClick`, `clickNth`, `ctrlClick`, `shiftClick`, `hover`, `dragAndDrop` |
| **Input** | `fill`, `type`, `clear`, `pressKey`, `pressGlobalKey`, `selectAllText`, `selectByLabel`, `selectByValue`, `check`, `uncheck`, `uploadFile`, `clearFile`, `pasteText` |
| **Navigation** | `goto`, `getCurrentUrl`, `getPageTitle`, `reload`, `goBack`, `goForward`, `openNewTab`, `closePage` |
| **Waits** | `waitForVisible`, `waitForHidden`, `waitForAttached`, `waitForDetached`, `waitForUrl`, `waitForNetworkIdle`, `waitForApiResponse`, `sleep` |
| **Reading** | `getText`, `getTextContent`, `getAttribute`, `getInputValue`, `getInnerHTML`, `getAllTexts`, `isVisible`, `isEnabled`, `isDisabled`, `isChecked`, `isPresent` |
| **Screenshots** | `screenshot` (full page), `screenshotElement` (single element) |
| **Scroll** | `scrollIntoView`, `scrollToBottom`, `scrollToTop`, `scrollBy`, `jsScrollIntoView` |
| **Dialogs** | `acceptDialog`, `dismissDialog`, `acceptDialogWithValue` |
| **iFrame** | `frameLocator` |
| **Download** | `clickAndDownload` |
| **JavaScript** | `executeScript`, `jsScrollIntoView` |
| **Storage** | `clearCookies`, `clearLocalStorage`, `clearSessionStorage`, `getLocalStorageItem`, `setLocalStorageItem` |
| **Clipboard** | `getClipboardText` |
| **Focus** | `focus`, `blur` |
| **Position** | `getBoundingBox` |

---

## Team Conventions

- **Never** hardcode credentials in feature files, step files, or page classes — use `.env.qa` / `.env.uat`.
- **Selectors live in page classes only** — as `private get` `Locator` getters. Never in step files.
- **Prefer stable selectors** — `data-testid`, `aria-label`, unique attributes. Avoid fragile XPath or positional selectors.
- **Steps are thin** — they call page methods or the API client. Business logic belongs in the page class.
- **Reuse steps** — before creating a new step, check the existing step files first.
- **Tags** — every scenario must have at least one of: `@smoke`, `@regression`, `@positive`, `@negative`, `@access`. API scenarios must also have `@api`.
- **File naming** — `<name>.<system>.<type>.ts` e.g. `login.sfdc.steps.ts`, `user-list.sfdc.page.ts`.


## Key Features

