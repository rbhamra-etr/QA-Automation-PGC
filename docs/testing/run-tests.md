# Run Tests

All test commands run `bddgen` first to regenerate spec files from `.feature` files + step bindings.

## By Environment

| Command | Environment | Browser |
|---------|-------------|----------|
| `npm test` | QA | headed Chrome |
| `npm run test:qa` | QA | headed Chrome |
| `npm run test:uat` | UAT | headed Chrome |
| `npm run test:qa:headed` | QA | headed Chrome (explicit) |
| `npm run test:uat:headed` | UAT | headed Chrome (explicit) |
| `npm run test:headed` | QA | headed Chrome (default) |
| `npm run test:ui` | — | Playwright UI mode |

## By System

| Command | System |
|---------|--------|
| `npm run test:sfdc` | SFDC only |
| `npm run test:web` | Web only |
| `npm run test:appian` | Appian only |
| `npm run test:fiori` | SAP Fiori only |
| `npm run test:sap` | SAP only |
| `npm run test:api` | API tests only (no browser) |
| `npm run test:browser` | All browser tests (no API) |
| `npm run test:e2e` | End-to-end integration tests |

## By Tag

| Command | Runs |
|---------|------|
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

**Combine tags (OR / AND):**

```powershell
# OR — @smoke OR @access
npm run test:qa:tag -- "@smoke|@access"

# AND — must have BOTH @access AND @positive
npm run test:qa:tag -- "(?=.*@access)(?=.*@positive)"
```

## Reports

| Report | Path |
|--------|------|
| Playwright HTML | `reports/playwright/` — open with `npm run test:report` |
| Cucumber JSON | `reports/cucumber/cucumber-report.json` |
| Rich Cucumber HTML | `reports/cucumber-rich/` — open with `npm run test:report:cucumber` |

## Xray Upload

```bash
npm run xray:upload:cucumber
```
