# Quick Start

1. Install dependencies.

```bash
npm install
```

2. Copy the environment template and fill in credentials for your target environment.

```bash
copy .env.example .env.qa    # fill in QA values
copy .env.example .env.uat   # fill in UAT values
```

3. Generate BDD specs (safe to run anytime).

```bash
npm run bdd:gen
```

4. Run smoke tests against QA.

```bash
npm run test:smoke
```

5. Optional: run one feature file directly.

```powershell
npm run test:qa:file -- .features-gen/functionalities/request-fastners/features/request-fasteners.feature.spec.js --project=chrome --workers=4
```

> **Tip:** Run `npm run test:ui` to open Playwright’s interactive UI mode.

## First-Run Validation Checklist

- `npm run bdd:gen` completes without generation errors
- `npm run test:smoke` starts Playwright successfully
- Reports are generated under `reports/playwright/` and `reports/cucumber/`

## Step Validation Commands

Run these before committing feature changes:

```powershell
npm run validate:find-step-definition -- "Given the Toll Rate API is available"
npm run validate:map-feature-steps -- functionalities/toll-calculator-apis/features/toll-rate-api.feature
```

## Local Pre-Commit Hook Setup

1. Create `.githooks/pre-commit` in the repo.
2. Add your validation command(s) to that file.
3. Configure git to use local hooks:

```powershell
git config core.hooksPath .githooks
```

## TODO List

- Hook validation for changed `.feature` files only.
- Add unresolved-step validation to pull request checks.
- Add examples for common unresolved-step fixes.
