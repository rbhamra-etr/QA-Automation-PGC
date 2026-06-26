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

3. Run smoke tests against QA.

```bash
npm run test:smoke
```

> **Tip:** Run `npm run test:ui` to open Playwright’s interactive UI mode.
