# Full Local Setup and CORS

## Local Setup

1. Install dependencies.

```bash
npm install
```

2. Copy the environment template and fill in credentials.

```bash
copy .env.example .env.qa    # fill in QA values
copy .env.example .env.uat   # fill in UAT values
```

3. Run a suite.

```bash
npm run test:web
```

## CORS Configuration

- Ensure the AUT allows browser requests from your test origin.
- If auth/session cookies are used, allow credentials for the test origin.
- Keep allowed origins explicit per environment; avoid wildcard origins in protected environments.

## Documentation Naming Convention

- Use lowercase kebab-case for new Markdown files: `topic-name.md`.
- Keep standard index files as `README.md` only where needed for folder landing pages.
- Place project docs under domain folders in `docs/` (for example `getting-started/`, `testing/`, `architecture/`).
- For imported/reference material, keep it under `docs/copied-from-other-project/` until adapted to this project.

Examples:
- Valid: `docs/testing/add-role-based-scenario.md`
- Valid: `docs/architecture/framework-boundaries.md`
- Avoid: `HOW_TO_ADD_A_SCENARIO.md`, `QuickStart.md`, `codingStandards.md`
