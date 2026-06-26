# Copilot Instructions — Playwright BDD Framework

This is a **Playwright + playwright-bdd (Gherkin)** test automation framework that tests
**five systems** from one project: SFDC, Web, Appian, SAP Fiori, and APIs.

> **Golden rule:** reuse existing steps before writing new ones. Read the step files under
> `step-definitions/` first. Only add a step when no existing step expresses the intent.

---

## Architecture

```
features/                          # Gherkin specs — one subfolder per system
  sfdc/ web/ appian/ fiori/ sap/ api/ iadaptive/ e2e/
  billings/ promotions/ request-fastners/

core/                              # Framework engine — app-agnostic, never imports app code
  configs/
    app-registry.config.ts         # ⭐ SINGLE SOURCE OF TRUTH — lookup functions for all apps + APIs
  consts/
    app-registry.const.ts          # UI_APPS[] and API_SERVICES[] data arrays
    browser.const.ts               # CHROME_ARGS, AUTH_HEADERS_TO_STRIP
    toll-rate.const.ts             # ZONE_DEFINITIONS, STATUTORY_HOLIDAYS
  models/                          # Interfaces (exported shapes)
    api-context.model.ts           # ApiContext
    app-registry.model.ts          # UiAppConfig, ApiServiceConfig
    base-api.model.ts              # ApiResult, RequestOptions
    toll-rate.model.ts             # ExpectedZone
  types/                           # Type aliases
    app-registry.type.ts           # LaunchMode
    browser.type.ts                # BrowserSession
  factories/
    browser.factory.ts             # launchIncognitoBrowser(), cleanupBrowser()
  fixtures/
    test.fixture.ts                # BDD fixtures: page, iadaptivePage, pages, session
    page-provider.fixture.ts       # Lazy registry — register new UI page objects here
  helpers/
    toll-rate.helper.ts            # Zone/day-type/time-band/direction resolvers
  shared/                          # Shared page + API base classes
    base.page.ts                   # 50+ pre-built UI actions — every page class extends this
    base.api.ts                    # Generic HTTP client (429 retry, report attach)
    iadaptive.page.ts              # IAdaptive portal login + tile launcher
    sfdc.page.ts / web.page.ts / appian.page.ts / sap.page.ts / fiori.page.ts

pages/                             # Page object classes — one subfolder per system
  base.page.ts                     # Re-export of core/shared/base.page.ts
  sfdc/  web/  appian/  sap/  iadaptive/

step-definitions/                  # BDD step implementations — one subfolder per system
  api/
    common.api.steps.ts            # Generic API steps usable by any service
    context.api.ts                 # Per-scenario API state (last response + meta)
    toll-rate.api.steps.ts         # Toll-specific request + assertion steps
  sfdc/  web/  appian/  sap/  iadaptive/  e2e/

data/                              # Test data — CSV files, rate charts, reference tables
  api/  sfdc/

support/                           # Legacy files — NOT active, do not import from here
scripts/                           # Report generation + Xray upload utilities
```

---

## Layer rules

- `core/` knows nothing about any specific app or API — never add app logic here.
- `core/configs/` + `core/consts/` are the **only** place to register a new app or API.
- `pages/<system>/` owns locators and page actions for that system only.
- `step-definitions/<system>/` owns BDD steps for that system only. Steps must be thin — call page methods, not implement logic.
- `core/shared/` holds base classes shared across all systems.

---

## The app-registry is the control panel

[core/configs/app-registry.config.ts](../core/configs/app-registry.config.ts) exposes lookup functions.
[core/consts/app-registry.const.ts](../core/consts/app-registry.const.ts) holds the data arrays.

Each entry decides:
- `launch: 'iadaptive'` — login to the portal and click a tile to open the app.
- `launch: 'standalone'` — navigate directly to the app's own URL with its own credentials.
- `baseUrlEnvVar` — env var holding an API service's base URL.

**iAdaptive is deliberately NOT in the registry** — it is the login gateway, not an app under test.

---

## How to add things

### Add a UI system launched via iAdaptive (Appian / Fiori / SAP pattern)
1. Add an entry to `UI_APPS` in [core/consts/app-registry.const.ts](../core/consts/app-registry.const.ts) with `launch: 'iadaptive'` and the portal `tile` text.
2. Create `pages/<system>/<system>.page.ts` extending `BasePage`.
3. Register it in [core/fixtures/page-provider.fixture.ts](../core/fixtures/page-provider.fixture.ts).
4. Write steps in `step-definitions/<system>/`.
5. The generic login step already works: `Given I am logged in to "<System>" as "<role>"`.

### Add a standalone UI system (Web pattern)
Same as above, but set `launch: 'standalone'` and `urlEnvVar` in the registry.

### Add a new company API
1. Add an entry to `API_SERVICES` in [core/consts/app-registry.const.ts](../core/consts/app-registry.const.ts) with `baseUrlEnvVar`.
2. Write service-specific steps in `step-definitions/api/`.
3. The generic API steps work immediately for the new service.

---

## Conventions

- **File naming**: `<name>.<system>.<role>.ts` — e.g. `login.sfdc.steps.ts`, `user-list.sfdc.page.ts`.
- **Folder naming**: singular for type/role suffix, plural for collection folders (`models/`, `types/`, `consts/`).
- **Types before constants before functions** — in every file, declare types/interfaces at the top, then constants, then functions/classes.
- **Page objects**: one class per screen, `extends BasePage`. Locators as `private get` returning `Locator`. No raw selectors in step files.
- **Steps**: thin. Call page methods or the API client. No business logic. Assertions in `Then` steps only.
- **Step phrasing**: generic, parameterized, quoted values — e.g. `Given I am logged in to "SFDC" as "CSR"`.
- **Credentials**: env vars only — `{APP}_{ROLE}_USERNAME` / `{APP}_{ROLE}_PASSWORD`. Role names are uppercased, spaces → `_`.
- **No secrets in code or features.** Use `.env.qa` / `.env.uat`.
- **Test data** lives in `data/` — never hardcoded in steps or feature files.
- **Tags**: every scenario needs at least one of `@smoke @regression @positive @negative @access`. API scenarios must also have `@api`.
- **Do NOT import from `support/`** — those are legacy `@cucumber/cucumber` files, superseded by `core/fixtures/`.

---

## Running tests

```powershell
npm test                        # All tests, QA, headed Chrome
npm run test:qa                 # QA environment
npm run test:uat                # UAT environment
npm run test:api                # API tests only (no browser)
npm run test:browser            # Browser tests only (no API)
npm run test:sfdc               # SFDC system only
npm run test:web                # Web system only
npm run test:smoke              # @smoke tag
npm run test:regression         # @regression tag
npm run test:qa:tag -- @smoke   # Any tag, QA
npm run test:uat:tag -- @smoke  # Any tag, UAT
npm run test:ui                 # Playwright interactive UI mode
npm run xray:upload:cucumber    # Upload results to Xray
```

`npm test` runs `bddgen` first to regenerate spec files from features + steps.
