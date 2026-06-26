# Area 1 — Step Text Ambiguity

> ##Status:## 🟡 In Progress
> ##References:## [MASTER.md](./MASTER.md)

---

## Overview

Step text ambiguity is the most critical problem in the entire system. If step text is ambiguous, every downstream component — feature files, step definitions, POMs, locators — inherits and multiplies that ambiguity.

---

## Challenges & Solutions

### 1.1 — Duplicate Step Text Across Different Pages ✅ Finalized

| | |
|---|---|
| ##Challenges## | Same step text used across different pages and roles with no context. LLM cannot determine page, POM, locator, or whether to create or reuse a step definition. |
| ##Examples## | 'User clicks the Submit button' appears in Login flow AND Credit Limit flow AND Registration flow |
| ##Impact## | LLM generates duplicate or conflicting step definitions. Cross-feature file duplication. No idea where to look for either. Orphan POM entry. These don't exist. Cannot work. |
| ##Solutions## | Page name mandatory in every step. Separate feature files per role. Steps always generic. Role determined by file name and test data. |

---

### 1.2 — Multiple Actions In One Step ✅ Finalized

| | |
|---|---|
| ##Challenges## | Step text collapses multiple distinct actions into a single step. The step cannot be mapped to exactly one format from the Universal Step Format Library. The LLM cannot determine how many step definitions to generate, or which locators are involved, or how to parameterize correctly. Every downstream asset — step definitions, POMs, locators — is either wrong or incomplete. |
| ##Examples## | 'User enters [username] and clicks the Submit button on the Login page' | Two formats (EX + F1) in one step |
| | 'User logs into the application' | Hidden multi-step flow (navigate, enter, enter, click) |
| | 'User fills in the Payment form on the Make a Payment page' | Unknown fields, unknown values — maps to multiple PGs |
| | 'User clicks Submit and sees the Confirmation on the Make a Payment page' | Action + PG — makes one step |
| ##Solutions## | One step = one format. If a step cannot be mapped to exactly one format from the Universal Step Format Library, it MUST be split at authoring time. Implicit flow steps (e.g. login) must be written as atomic steps in Background using standard formats — not collapsed into a single step. |

---

##Common Patterns That Trigger This##

| Pattern | Example | Problem |
|---------|---------|---------|
| Compound verb | 'User enters [username] and clicks the Submit button on the Login page' | Two formats (EX + F1) in one step |
| Implicit flow | 'User logs into the application' | Hidden multi-step flow (navigate, enter, enter, click) |
| Vague setup | 'User fills in the Payment form on the Make a Payment page' | Unknown fields, unknown values — maps to multiple PGs |
| Bundled assertion | 'User clicks Submit and sees the Confirmation on the Make a Payment page' | Action + PG — makes one step |

##Rules Applied##

- One step = one format from the Universal Step Format Library
- Multi-action steps must be split at authoring time — not at generation time
- Implicit flow steps permitted inside scenarios — must use Background with all standard format rules
- Background UI interaction steps follow all standard format rules including D1/D2
- Background state declaration steps use 'User is ...' prefix — page name not required
- Authentication and session setup written as explicit atomic UI steps in Background
- No hooks or fixtures at this stage — revisit in Areas 11-14

---

##Before vs After##

```
---

❌ BEFORE:
User enters [username] and clicks the Submit button on the Login page

✅ AFTER:
User enters [username] in the Username field on the Login page
User clicks the Submit button on the Login page
```

```
---

❌ BEFORE (scenario step):
User logs into the application

✅ AFTER (Background = atomic UI steps):
Background:
  Given User navigates to the Login page
    And User enters [username] in the Username field on the Login page
    And User enters [password] in the Password field on the Login page
    And User clicks the Submit button on the Login page
```

```
---

❌ BEFORE:
User clicks Submit and sees the Confirmation on the Make a Payment page

✅ AFTER:
User clicks the Submit button on the Make a Payment page
User should see the Confirmation message on the Make a Payment page
```

---

##Background Step Rules##

| Step Type | Keyword | Page Name Required? | Handled by |
|-----------|---------|---------------------|------------|
| State declaration | 'User is ...' | No | Inferred context — no step definition generated |
| UI interaction | 'User [action verb] ...' | Yes — D1/D2 apply | Step definition — standard formats |

---

##Background State Declaration Examples##

```
✅ Given User is logged in as [account-owner]
✅ Given User is enrolled in autopay
✅ Given User is on the My Account page
```

```
---

> ##Note:## 'User is ...' keyword is provisional. Must be revisited once application access is granted and actual Background patterns are known.

---

### 1.3 — Pronoun Ambiguity 🔴 Pending

| | |
|---|---|
| ##Challenges## | TBD |
| ##Solutions## | TBD |

---

### 1.4 — Steps Implying Unknown UI Knowledge 🔴 Pending

| | |
|---|---|
| ##Challenges## | TBD |
| ##Solutions## | TBD |

---

## Jira & Xray Touchpoints

| Touchpoint | Tool | Detail |
|------------|------|--------|
| Requirements source | Jira | Story description and Acceptance Criteria — primary input for test case authoring. AC quality directly constrains step quality. See CR1. |
| Test case steps | Xray | Cucumber scenario steps OR Manual action/expected result fields — both valid per D10 |
| Step text authored | Xray | Must conform to Universal Step Format Library. Drives all test generation. |
| Step text generated | Jira → Xray | LLM reads Jira + Xray. Generates conforming step text. AC-style natural language. Output written to Xray Cucumber or Manual test. |
| Existing test cases | Xray | Assessed in bulk by LLM against D1-D16 violation checklist. Triage: CONFORMING / REMEDIABLE / DISCARD. See CR3. |

---

## Prevention | Detection | Correction

Applies equally whether test cases are created or updated manually or by LLM.

| Layer | Manual Path | LLM Path |
|-------|-------------|----------|
| Prevention | Authoring reference card — seven format templates, key rules in plain language. QA team has this open alongside Jira story when writing in Xray. | D1-D16 pre-flight prompt injection. LLM self-validates Universal Step Format Library before test case is approved. Violation checklist: no page name, role in step text, hardcoded value, multi-action step, implicit flow collapsed into one step. | LLM violation checks each step before test case approved. See Areas 11-14. |
| ##Detection## | QA team runs Universal Step Format Library validation on pull request. Flag violations with rule reference. |
| ##Correction## | QA team rewrites non-conforming step in Xray. Step blocked from generation pipeline until approved. | LLM correction pass rewrites flagged step. QA team approves rewrite in Xray before test case enters generation pipeline. |

---

### Violation Checklist — Area 1

| Violation | Rule | Example |
|-----------|------|---------|
| No page name in step | D1/D2 | 'User clicks the Submit button' |
| Page name not last | D2 | 'User clicks the Submit button on the Login page in the form' |
| Role in step text | D3 | 'Account owner clicks the Submit button on the Login page' |
| Multi-action step | D11 | 'User enters [username] and clicks the Submit button on the Login page' |
| Implicit flow collapsed into one step | D12 | 'User logs into the application' |
| State declaration inside scenario | D13 | 'User is authenticated as [account-owner]' inside a Scenario block |

---

## Decisions From This Area

| # | Decision | Rule | Status |
|---|----------|------|--------|
| D1 | Page name mandatory | Every step MUST include page name. No exceptions. | Locked |
| D2 | Page name always last | 'on the {PageName} page' is always final component | Locked |
| D3 | Actor always first | 'Actor' always first word. Currently always 'User' | Locked |
| D4 | Separate feature files per role | Each rule gets its own feature file | Locked |
| D5 | Steps always generic | Role never in step text | Locked |
| D11 | One step = one format | One step to exactly one format from the Universal Step Format Library. No exceptions. | Locked |
| D12 | Multi-action steps are invalid | Any step requiring two formats to express is two steps. Must be split at authoring time. | Locked |
| D13 | Implicit flow steps not permitted | Implicit flow steps not permitted in scenarios — must use Background with all standard format steps | Locked |
| D14 | State declarations use 'User is ...' prefix | Background steps from page name rule | 'Given User is ...' steps declare state only. No step definition. No page name required. All others follow D1/D2. Provisional — revisit once no access granted |
| D15 | Authentication setup written as atomic UI steps in Background | Login and session setup expressed as explicit steps using standard format. No hooks or fixtures this stage. Revisit in Areas 11-14 |
| D16 | 'User is ...' prefix signals state declaration | Background steps beginning with 'User is ...' are state declarations. No page name required. All others follow D1/D2. Provisional — revisit once app access granted |