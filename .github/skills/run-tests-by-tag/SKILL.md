---
name: run-tests-by-tag
description: "Run Playwright+Cucumber tests by app tags mapped to feature root folders (@web, @sap, @sfdc, @appian, @integration), smoke, or all suites."
argument-hint: "Choose one: web, sap, sfdc, appian, integration, smoke, or all"
user-invocable: true
---

# Run Tests By Tag

Use this skill to run tests by app tag (feature-folder based), smoke, or all.

## App Tags

- `@web`
- `@sap`
- `@sfdc`
- `@appian`
- `@integration`

## Preferred Commands

Use npm scripts from `package.json`:
- `npm test`
- `npm run test:smoke`
- `npm run test:web`
- `npm run test:sap`
- `npm run test:sfdc`
- `npm run test:appian`
- `npm run test:e2e`

## Fallback Commands

- `npm run test:qa:tag -- @web`
- `npm run test:qa:tag -- @sap`
- `npm run test:qa:tag -- @sfdc`
- `npm run test:qa:tag -- @appian`
- `npm run test:qa:tag -- @integration`
- `npm run test:qa:tag -- @smoke`
- `npm run test:qa`

## Notes

- Tags are expected to align with the module feature files under `functionalities/**/features/`.
- Run `node scripts/validate-feature-tags.js` if tag alignment is in doubt.
