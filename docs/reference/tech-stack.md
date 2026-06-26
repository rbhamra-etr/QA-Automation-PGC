# Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 20+ |
| Language | TypeScript |
| BDD Framework | playwright-bdd (Gherkin / Cucumber syntax) |
| Browser Automation | Playwright (`@playwright/test`) |
| Test Runner | Playwright Test runner (via playwright-bdd) |
| Browser | System Chrome — incognito, no Playwright browser download needed |
| Reporting | Playwright HTML · Cucumber JSON · Rich Cucumber HTML |
| Env management | dotenv + cross-env |
| Formatting | Prettier |
| CI | GitHub Actions |

## Key Package Versions

See `package.json` for exact pinned versions.

- `playwright-bdd` — BDD layer (feature parsing, step binding, spec generation via `bddgen`)
- `@playwright/test` — test runner + browser automation
- `typescript` — type safety
- `dotenv` — `.env.qa` / `.env.uat` environment loading
- `cross-env` — cross-platform `ENV=qa` variable injection
- `multiple-cucumber-html-reporter` — rich Cucumber HTML report
