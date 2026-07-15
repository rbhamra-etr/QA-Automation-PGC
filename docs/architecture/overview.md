# Architecture Overview

## System Map

The framework tests five systems from a single project.

| System | Launch Mode | Notes |
|--------|-------------|-------|
| SFDC | iAdaptive portal tile | Role-based credentials |
| Appian | iAdaptive portal tile | Role-based credentials |
| SAP / Fiori | iAdaptive portal tile | Role-based credentials |
| Web | Standalone URL | Role-based credentials |
| APIs | HTTP only — no browser | Service base URL from env |

iAdaptive is the shared login gateway — not a system under test. It is never registered in the app-registry.

---

## Layer Diagram

```
Feature Files  (.feature)
  └─ Step Definitions  (functionalities/<module>/step-definitions/)
    ├─ Page Objects  (shared/apps/<system>/)
    │    └─ BasePage  (shared/core/shared/base.page.ts)
       │         └─ Playwright Browser
    └─ API Client  (shared/core/shared/base.api.ts)
            └─ HTTP
```

---

## Core Engine Structure

```
functionalities/
  common/step-definitions/   ← Shared reusable steps across modules
  <module>/
    features/                ← Gherkin feature files
    step-definitions/        ← Domain-specific step bindings
    data/                    ← Module test data

shared/
  apis/context.api.ts        ← API scenario context state
  apps/<system>/             ← App-owned page objects/locators
  core/
    configs/
      app-registry.config.ts   ← SINGLE SOURCE OF TRUTH — lookup functions for all apps + APIs
      env.config.ts            ← ENV object and credential resolvers
    consts/
      app-registry.const.ts    ← UI_APPS[] and API_SERVICES[] data arrays
      browser.const.ts         ← Chrome launch args, headers to strip
      toll-rate.const.ts       ← Zone definitions, statutory holidays
    models/                    ← TypeScript interfaces (exported shapes)
    types/                     ← TypeScript type aliases
    factories/
      browser.factory.ts       ← Incognito Chrome launcher + cleanup
    fixtures/
      test.fixture.ts          ← BDD fixtures: page, iadaptivePage, pages, session
      page-provider.fixture.ts ← Lazy page-object registry
    helpers/
      toll-rate.helper.ts      ← Zone, day-type, time-band, direction resolvers
    utils/
      date.util.ts             ← Date helpers
      logger.util.ts           ← Structured logger
      test-data.util.ts        ← Test data loader
    shared/
      base.page.ts             ← 50+ pre-built UI actions (every page class extends this)
      base.api.ts              ← Generic HTTP client (429 retry, report attach)
      iadaptive.page.ts        ← IAdaptive portal login + tile launcher
      sfdc.page.ts             ← SFDC base page class
      web.page.ts              ← Web base page class
      appian.page.ts           ← Appian base page class
      sap.page.ts              ← SAP base page class
      fiori.page.ts            ← Fiori base page class
```

---

## Key Design Decisions

- `shared/core/` is fully app-agnostic — no app-specific logic ever goes there.
- `shared/core/configs/app-registry.config.ts` is the only place to register an app or API service.
- A single generic login step (`I am logged into {string} as {string}`) handles all systems.
- `shared/apps/<system>/` owns all locators and UI actions for that system only.
- `functionalities/<module>/step-definitions/` contains thin wrappers — no business logic, no locators.
- `support/` is empty — legacy `@cucumber/cucumber` files superseded by `shared/core/fixtures/`.

---

## File Naming Convention

`<name>.<system>.<role>.ts`

| Example | Type |
|---------|------|
| `login.sfdc.steps.ts` | Step definition |
| `user-list.sfdc.page.ts` | Page object |
| `browser.const.ts` | Constant |
| `app-registry.model.ts` | Interface |
| `browser.type.ts` | Type alias |

---

## Scripts & Tooling

```
scripts/
  xray/
    common.xray.ts                  ← Shared HTTP client, types, argument parser, context I/O
    create-test-execution.xray.ts   ← Create or reuse a Xray Test Execution
    sync-test-runs.xray.ts          ← Update test run statuses + comments from Cucumber results
    upload-test-evidence.xray.ts    ← Attach evidence files to matching test runs
    import-features.xray.ts         ← Import .feature files into Xray as Test issues
    import-cucumber-execution.xray.ts ← Import Cucumber JSON report directly into Xray
    run-pipeline.xray.ts            ← Orchestrates the full Xray pipeline (create → sync → evidence)
  reporting/
    generate-rich-cucumber-report.ts ← Generates the rich HTML Cucumber report
    rich-cucumber-reporter.ts        ← Playwright reporter plugin wired via playwright.config.ts
  validation/
    find-step-definition.validation.ts  ← Locate a step definition by step text
    map-feature-steps.validation.ts     ← Map all feature steps to their definitions
```

### Environment Loading

All scripts consume a **single env source of truth**: `shared/core/configs/env.config.ts`.

- Loads `.env.<ENV>` (e.g. `.env.qa`, `.env.uat`) based on the `ENV` environment variable.
- Falls back to `.env` if no env-specific file exists.
- Exposes `requireEnvVar(name)` and `requireEnvVars(names, scope)` helpers that throw early with clear messages when variables are missing.
- Credential convention: `{APP}_{ROLE}_USERNAME` / `{APP}_{ROLE}_PASSWORD`.

### Xray Pipeline Flow

```
npm run xray:run-pipeline -- --test-plan <KEY> --environment <ENV>
```

1. **Preflight** — validates that all required Jira + Xray env vars are present (`JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `XRAY_CLIENT_ID`, `XRAY_CLIENT_SECRET`).
2. **Create/reuse execution** (`create-test-execution.xray.ts`) — creates a new Xray Test Execution linked to the Test Plan, or reuses one passed via `--execution`.
3. **Sync test runs** (`sync-test-runs.xray.ts`) — reads `reports/cucumber/cucumber-report.json`, matches Jira keys in scenario names/tags, and updates Xray test run statuses.
4. **Upload evidence** (`upload-test-evidence.xray.ts`) — optional, enabled with `--upload-evidence`; attaches screenshots and logs from `reports/errors/` to matching test runs.

### Hooks

Playwright-bdd hooks run within the BDD fixture lifecycle:

- **`Before` / `After`** — declared in step definition files using `Before()` / `After()` from `@cucumber/cucumber`. Scoped per tag, per feature, or globally.
- **`BeforeAll` / `AfterAll`** — for suite-level setup/teardown (e.g. browser launch, test data seeding).
- **Reporter hook** — `shared/core/scripts/reporting/rich-cucumber-reporter.ts` is registered as a Playwright reporter in `playwright.config.ts` and runs automatically at the end of every test run to generate the rich HTML report.
- **Teardown** — global teardown logic (if needed) belongs in `playwright.config.ts → globalTeardown`, not in a standalone script file.

### Known Limitations & Planned Improvements

| Area | Current State | Planned Improvement |
|------|--------------|---------------------|
| Xray script architecture | File-level function exports in `common.xray.ts` | Introduce `XrayClient` and `JiraClient` service classes |
| Env loading in Xray scripts | Each script manages its own dotenv loading | Single call to `env.config.ts`; all scripts reuse shared helpers |
| Pipeline error reporting | Generic `fetch failed` messages | Host-level diagnostics, error codes, TLS CA hint |
| Xray GraphQL query limits | `tests(limit: 500)` exceeds API max | Fix to `tests(limit: 100)` |
| CI guard scripts | Not present in PGC | Port `check-forbidden-files.ts` and style guards from `QA-Playwright_Automation` |
| TypeScript strictness | `tsconfig.json` uses default strictness | Incremental strict profiles per domain (core, scripts, apps) |
