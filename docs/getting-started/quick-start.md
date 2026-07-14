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
