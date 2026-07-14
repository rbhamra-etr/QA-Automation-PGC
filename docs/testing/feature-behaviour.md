# Feature Inventory

## Active Features

| Feature File | Tags | System | Role / User | Intent |
|---|---|---|---|---|
| functionalities/request-fastners/features/request-fasteners.feature | `@smoke @access @positive` / `@access @negative` / `@customer @regression` | SFDC | Multiple roles | Request Fasteners visibility by role from BA Requests menu |
| functionalities/web-login-validation/features/login.web.feature | `@web @smoke` + `@positive` / `@negative` | Web | Customer | Login with valid and invalid credentials |
| functionalities/toll-calculator-apis/features/toll-rate-api.feature | `@api @toll-rate` | API | — | Toll rate calculations and zone validation |

## Empty Placeholder Folders

These folders are present for growth but currently have no active feature files in this repository snapshot:

- `functionalities/promotions/`

## Tag Reference

| Tag | Used For |
|-----|---------|
| `@sfdc` | SFDC system tests |
| `@web` | Web portal tests |
| `@sap` | SAP tests |
| `@appian` | Appian tests |
| `@api` | API-only tests (no browser) |
| `@iadaptive` | IAdaptive portal tests |
| `@integration` | Cross-system e2e flows |
| `@smoke` | Smoke suite |
| `@regression` | Regression suite |
| `@positive` | Happy path |
| `@negative` | Error / unhappy path |
| `@access` | Role-based access control |
| `@customer` | Customer-facing behaviour |
