---
name: step-ownership-validation
description: "Validate that every step definition and POM method is in the correct app-scoped file. Detects misplaced steps, wrong POM usage, missing POM methods, and multi-keyword registration gaps across iadaptive, sfdc, sap, appian, web, and integration apps."
argument-hint: "Ask to validate a specific feature file, a specific app, or the entire suite"
user-invocable: true
---

# Step Ownership Validation

Use this skill to verify that every Gherkin step and every POM locator/method is placed in its correct app-scoped file, and that multi-keyword steps are registered for all keywords used.

## App-to-Folder Ownership Map

| App         | Feature folder          | Step definitions folder          | Page objects folder     |
|-------------|-------------------------|----------------------------------|-------------------------|
| iadaptive   | features/iadaptive/     | step-definitions/iadaptive/      | pages/iadaptive/        |
| sfdc        | features/sfdc/          | step-definitions/sfdc/           | pages/sfdc/             |
| sap         | features/sap/           | step-definitions/sap/            | pages/sap/              |
| appian      | features/appian/        | step-definitions/appian/         | pages/appian/           |
| web         | features/web/           | step-definitions/web/            | pages/web/              |
| integration | features/integration/   | step-definitions/integration/    | pages/integration/      |

## Step Ownership Convention

Step text follows this naming convention to signal app ownership:

```
<action> on Page <PageName> of <App>
```

Examples:
- `User navigates to IAdaptive access portal on Page Access of IAdaptive` → belongs to `iadaptive`
- `User clicks the setup gear icon on Page Home of SFDC` → belongs to `sfdc`

Use the suffix `of <App>` (case-insensitive) to determine the owning app:

| Suffix in step text | Owning app  |
|---------------------|-------------|
| `of IAdaptive`      | iadaptive   |
| `of SFDC`           | sfdc        |
| `of SAP`            | sap         |
| `of Appian`         | appian      |
| `of Web`            | web         |
| `of Integration`    | integration |

## POM Ownership Convention

Each POM class is scoped to its app folder:

| POM class                                | Belongs to       |
|------------------------------------------|------------------|
| `IAdaptiveHomePage`                      | pages/iadaptive/ |
| `SfdcUserListPage`, `SfdcCasePage`       | pages/sfdc/      |
| `SapInvoicePage`                         | pages/sap/       |
| `AppianHomePage`, `AppianDashboardPage`  | pages/appian/    |
| `WebHomePage`, `WebAccountPage`          | pages/web/       |

A step definition file in `step-definitions/sfdc/` must only instantiate POM classes from `pages/sfdc/`.
IAdaptive-owned steps that appear in an SFDC feature scenario must still be defined in `step-definitions/iadaptive/` using `pages/iadaptive/` POMs.

## Multi-Keyword Step Registration

Steps that are semantically usable as both `When` and `Then` must be registered explicitly for all applicable keywords using a shared function reference:

```typescript
// Correct — one implementation, multiple keyword registrations
const verifyFn = async function (this: CustomWorld) { /* impl */ };
When('User verifies X on Page Y of App', verifyFn);
Then('User verifies X on Page Y of App', verifyFn);
```

`And` and `But` inherit the keyword from the previous step automatically and do not require explicit registration.

## Validation Procedure

### Step 1 — Discover all feature files
Read every `.feature` file under `features/`. For each scenario, collect every step text and note the keyword used (`Given`, `When`, `Then`, `And`, `But`).

### Step 2 — Resolve step ownership
For each step text, extract the app name from the `on Page X of <App>` suffix and map it to the owning app folder.

### Step 3 — Verify steps are defined in the correct app folder
Search all `.ts` files under `step-definitions/` for each step text. Verify the file is under the correct app subfolder. Report violations:

```
[MISPLACED STEP]
Step text   : "User navigates to IAdaptive access portal on Page Access of IAdaptive"
Defined in  : step-definitions/sfdc/user-list.sfdc.steps.ts   ← WRONG
Should be in: step-definitions/iadaptive/
```

### Step 4 — Verify POM usage in step definition files
For each step definition file, identify which POM classes are instantiated. Verify each class belongs to the same app as the file. Report violations:

```
[WRONG POM USAGE]
Step file   : step-definitions/sfdc/user-list.sfdc.steps.ts
Instantiates: IAdaptiveHomePage (belongs to iadaptive)
Should use  : only SfdcUserListPage, SfdcCasePage, etc.
```

### Step 5 — Verify multi-keyword registration
For steps used with more than one Gherkin keyword across feature files, verify the step definition is registered for all keywords used. Report gaps:

```
[MISSING KEYWORD REGISTRATION]
Step text   : "User should see SFDC home page on Page Home of SFDC"
Used as     : Then, When
Registered  : Then only
Missing     : When
```

### Step 6 — Verify no undefined steps
For each step text in feature files, confirm a matching step definition exists in `step-definitions/`. Report missing ones:

```
[UNDEFINED STEP]
Step text   : "User does something undeclared on Page X of SFDC"
Found in    : features/sfdc/user-list.sfdc.feature
Defined in  : (none)
```

## Output Format

Produce a structured validation report:

```
=== Step Ownership Validation Report ===

Feature files scanned   : N
Scenarios found         : N
Steps found             : N
Step definition files   : N

--- MISPLACED STEPS ---
(list or "None found")

--- WRONG POM USAGE ---
(list or "None found")

--- MISSING KEYWORD REGISTRATIONS ---
(list or "None found")

--- UNDEFINED STEPS ---
(list or "None found")

--- MISSING OWNERSHIP SUFFIX ---
(list or "None found")

--- SUMMARY ---
✅ All checks passed  /  ❌ N issues found
```

## Constraints
- Do not modify any files. This skill is read-only analysis.
- Determine ownership only from the `on Page X of <App>` suffix or explicit POM class naming.
- If a step has no `of <App>` suffix, flag it as `[MISSING OWNERSHIP SUFFIX]` and recommend the developer add one.
- Report all issues before suggesting fixes.
