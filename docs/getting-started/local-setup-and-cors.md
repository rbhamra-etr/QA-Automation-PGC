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
