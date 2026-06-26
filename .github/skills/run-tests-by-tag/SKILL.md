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
- `npm run test:all`
- `npm run test:smoke`
- `npm run test:web`
- `npm run test:sap`
- `npm run test:sfdc`
- `npm run test:appian`
- `npm run test:integration`

## Fallback Commands

- `npx cucumber-js --tags "@web"`
- `npx cucumber-js --tags "@sap"`
- `npx cucumber-js --tags "@sfdc"`
- `npx cucumber-js --tags "@appian"`
- `npx cucumber-js --tags "@integration"`
- `npx cucumber-js --tags "@smoke"`
- `npx cucumber-js`

## Notes

- Tags are expected to align with folder names directly under `features/`.
- Run `npm run validate:feature-tags` if tag alignment is in doubt.
