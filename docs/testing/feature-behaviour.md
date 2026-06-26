# Feature Inventory

## Active Features

| Feature File | Tags | System | Role / User | Intent |
|---|---|---|---|---|
| features/sfdc/account.sfdc.feature | `@sfdc` | SFDC | CSR | Search and view customer account |
| features/sfdc/case.sfdc.feature | `@sfdc @smoke` | SFDC | CSR | View case queue / open cases list |
| features/sfdc/user-list.sfdc.feature | `@sfdc` | SFDC | Admin | Browse and manage SFDC user list |
| features/request-fastners/request-fasteners.feature | `@smoke @access @positive` / `@access @negative` / `@customer @regression` | SFDC | Multiple roles | Request Fasteners visibility by role from BA Requests menu |
| features/web/home.web.feature | `@web @smoke` | Web | Customer | Load and verify Web home page |
| features/web/Login.web.feature | `@web @smoke` + `@positive` / `@negative` | Web | Customer | Login with valid and invalid credentials |
| features/web/account.web.feature | `@web` | Web | Customer | View and verify account settings |
| features/sap/invoice.sap.feature | `@sap @smoke` | SAP | Finance user | Open invoice page and verify pending invoices |
| features/sap/payment.sap.feature | `@sap` | SAP | Finance user | Open payment page and post payment |
| features/iadaptive/home.iadaptive.feature | `@iadaptive @smoke` | IAdaptive | Portal user | Login and verify IAdaptive home page |
| features/api/Toll-Rate-API.feature | `@api @toll-rate` | API | — | Toll rate calculations and zone validation |
| features/e2e/payment.integration.feature | `@integration @smoke` | Cross-system | System | Cross-app payment flow (Web → SAP) |

## Empty Placeholder Folders

These folders are reserved but contain no feature files yet:

- `features/appian/`
- `features/fiori/`
- `features/billings/`
- `features/promotions/`

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
