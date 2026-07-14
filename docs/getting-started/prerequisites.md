# Prerequisites

- Node.js 20 or later
- npm
- Git
- Google Chrome installed locally (headed runs use system Chrome)
- PowerShell or terminal access from the repository root
- Access to target test environment
- Valid test credentials in local env file

## Required Local Files

- `.env.qa` for QA execution
- `.env.uat` for UAT execution

Create them from template:

```powershell
copy .env.example .env.qa
copy .env.example .env.uat
```

## Common Credential Pattern

- Role-based login: `{APP}_{ROLE}_USERNAME` and `{APP}_{ROLE}_PASSWORD`
- Single-user app: `{APP}_USERNAME` and `{APP}_PASSWORD`

Example:

- `SFDC_CSR_USERNAME`
- `SFDC_CSR_PASSWORD`
