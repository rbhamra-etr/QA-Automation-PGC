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
  └─ Step Definitions  (step-definitions/<system>/)
       ├─ Page Objects  (pages/<system>/)
       │    └─ BasePage  (core/shared/base.page.ts)
       │         └─ Playwright Browser
       └─ API Client  (core/shared/base.api.ts)
            └─ HTTP
```

---

## Core Engine Structure

```
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

- `core/` is fully app-agnostic — no app-specific logic ever goes there.
- `core/configs/app-registry.config.ts` is the only place to register an app or API service.
- A single generic login step (`I am logged into {string} as {string}`) handles all systems.
- `pages/<system>/` owns all locators and UI actions for that system only.
- `step-definitions/<system>/` contains thin wrappers — no business logic, no locators.
- `support/` is empty — legacy `@cucumber/cucumber` files superseded by `core/fixtures/`.

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
