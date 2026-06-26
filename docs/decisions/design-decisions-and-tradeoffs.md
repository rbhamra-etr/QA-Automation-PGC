# Design Decisions and Trade-offs

## Core Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | `core/` is app-agnostic | Framework engine is stable and reusable across all systems; app logic never bleeds in |
| 2 | App-registry as single source of truth | One file controls login mode, URLs, and credentials for every app; no scattered config |
| 3 | Generic login step (`I am logged into {string} as {string}`) | New apps require zero step code — just a registry entry |
| 4 | System-scoped folders for features, steps, pages | Stable CI targeting; clear ownership; no cross-system coupling |
| 5 | `BasePage` pre-built action library | 50+ actions available without re-implementation; DRY across all page objects |
| 6 | `playwright-bdd` over bare `@playwright/test` | Gherkin BDD without the `@cucumber/cucumber` dependency; built on top of Playwright runner |
| 7 | Incognito Chrome via factory | Clean auth state per test; uses system Chrome (no bundled browser download required in CI) |
| 8 | Models / types / consts in separate `core/` subfolders | LIFT principle — easy to locate any interface, type alias, or constant |
| 9 | `support/` left empty | Legacy `@cucumber/cucumber` files fully superseded by `core/fixtures/`; kept as placeholder |

## Trade-offs

| Trade-off | Pro | Con |
|-----------|-----|-----|
| System-first folder structure | Stable CI targeting; simple suite ownership | Cross-system navigation requires understanding multiple folders |
| Generic login step (string-parameterised) | One step covers all systems | App key must exactly match registry key — case-sensitive |
| Incognito Chrome (system binary) | No download in CI; clean state | Chrome must be installed on the CI agent |
| `playwright-bdd` spec gen (`bddgen`) | Gherkin stays as source of truth | `bddgen` must run before every test; adds ~1 s to startup |
| Role credentials from env var naming | No mapping file needed | Role name normalisation must be known (`spaces → _`, uppercase) |
