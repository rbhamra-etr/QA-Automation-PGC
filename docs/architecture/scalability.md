# Scalability Roadmap

## Architecture Scaling

- Keep app folders stable as execution boundaries.
- Scale domain coverage through filename convention and optional domain tags.
- Extract shared flows into reusable step and page helpers.

## Testing Scaling

- Continue tag-based suite partitioning in CI matrix.
- Add filename convention validation in tag validator.
- Add fixture strategy for deterministic test data.

## Feature Scaling

- Add new journeys by domain-named feature files per app.
- Keep integration flows thin and step-reuse focused.
- Track additions through docs/testing/feature-behaviour.md.

---

## Scripts & Tooling Improvements

The following improvements are planned and tracked in the project todo list.

### Xray Script Architecture

**Current:** All Xray logic lives as file-level exported functions in `scripts/xray/common.xray.ts`. Individual scripts import each function separately.

**Planned:** Introduce service classes to encapsulate state and behaviour:

- `XrayClient` — authentication, token lifecycle, GraphQL and REST HTTP calls.
- `JiraClient` — Jira REST API calls (search, issue fetch, `myself` health check).
- `XrayPipelineService` — orchestration of the create → sync → evidence flow.

Script entry-point files become thin: read CLI args, instantiate services, call `run()`.

### Environment Loading

**Current:** Some Xray scripts manage their own `dotenv.config()` calls, leading to duplicate loading logic.

**Planned:** All scripts import from `shared/core/configs/env.config.ts` exclusively. This file is the single source of truth for env-file selection, typed required-var validation, and credential resolution.

### TypeScript Strictness

**Current:** Single `tsconfig.json` with default strictness.

**Planned:** Incremental strict profiles per domain, following the pattern from `QA-Playwright_Automation`:

| Profile file | Scope |
|---|---|
| `tsconfig.strict-core.json` | `shared/core/**` |
| `tsconfig.strict-scripts.json` | `scripts/**` |
| `tsconfig.strict-apps.json` | `shared/apps/**` |

This allows strict rules to be adopted incrementally without blocking active development.

### CI Guard Scripts

**Current:** No automated checks for forbidden imports, incorrect step ownership, or naming violations.

**Planned:** Port from `QA-Playwright_Automation`:

- `check-forbidden-files.ts` — prevents importing from `support/` or other legacy paths.
- Naming convention validator — enforces `<name>.<system>.<role>.ts` pattern.

Run as pre-commit hooks and in CI before test execution.
