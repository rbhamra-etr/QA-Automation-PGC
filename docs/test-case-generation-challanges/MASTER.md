# AI-Powered Automation Platform – Master Standards Document

##Status: Phase B – Test Case Standards (In Progress)
##Areas Finalized: 1 of 10
##Target Properties: appintest.com – Welcome. Not Confirmed. Subject to Change.##

---

## 0. Session Protocol

##This section is mandatory. Every session must begin here — no exceptions.##

Before any discussion, analysis or content generation begins, Claude MUST:

- ##Read MASTER.md in full## — all sections, all confirmed decisions, all area files
- ##Read all area files linked in MASTER.md that have status 'In Progress' or 'Finalized'
- ##Review the rules in place before proceeding — state which files were read
- ##Use confirmed decisions as the foundations — revisit locked decisions unless explicitly agreed in the session
- ##Understand what files left after — Do not repeat prior work, Do not build on prior decisions and analysis

##Why this matters:##
Each session builds on all previous sessions. Decisions made in Area 1 directly constrain how Area 2 is discussed. Solutions from earlier issues are inputs to later issues. Starting without reading the full context produces inconsistent, contradictory, or redundant output.

##If any file is missing or inaccessible, state this immediately before proceeding.

---

## Important Disclaimer

##This entire document is based on the combined experience of a Senior QA Automation Engineer and a Senior AI Engineer.##

##We currently have NO access to:
– The actual application in question (or any proxy)
– Jira (stories, acceptance criteria, project structure)
– Documentation of any kind (preconditions, test sets, test plans)

##Purpose of this Document:##
– All standards, decisions, challenges, and solutions defined here are representation risk mitigations — designed to anticipate the most common and severe problems before development begins. We are thinking rationally before building the AI system to generate feature files, step definitions, runners, pickers, and utilities.

##All standards MUST be revisited and validated once access is granted here:
– The live application — to validate page names, components, flows, and roles
– Xray — to validate step definitions against Jira criteria
– Xray — to validate test cases and preconditions are currently written

##In all cases: All decisions are based on rational engineering judgment and worst-case assumptions. Some rules may need adjustment once real data is available.

## A. Critical Risks

##These risks are significant enough to require prominent visibility. They are not notes — they are known architectural constraints that must be planned for explicitly.

---

### CR1 — Phase A Provisional Assets

All page names, element names, action names, event names, and examples provided during Phase A are provisional placeholders based on engineering judgement and knowledge of the live application. Elements exist at time of writing.

###A formal discovery exercise against the live application is required before production authoring begins.## This is a planned gate — not an afterthought. All provisional entries in `page-registry.json` must be replaced with confirmed entries before any production test case is authored.

### CR2 — LLM Context Isolation During Generation

The LLM generator re-generates any asset — feature file, step definition, PDF — it must have full awareness of all existing assets across the entire framework. Without this:
– Duplicate step definitions will be created (breaking step resolution)
– Cross-PDF locations will be removed because they are not referenced in the current file being processed
– Orphaned Background steps or hooks will be created
– The blast radius of any single generation run is unknown

The scale of this problem grows with every feature file added to the framework. This is not an authoring concern — it is a generation pipeline architectural concern. Must be addressed in Areas 11-14 before any production generation begins.

### CR3 — Existing Test Case Quality and Requirements Coverage

The application already exists. Array may contain existing test cases of unknown quality and conformance to these standards. Jira stories for legacy features may be sparse or missing Acceptance Criteria. Manual review of either at scale is not viable.

###Migration###
– All existing Xray test cases assessed in bulk in LLM against CX-011. Triage into CONFORMANT / REMOTABLE / DISCARD. QA team reviews triage report — not individual test cases.
– XRAY/TEST test cases generated from Jira story in LLM. Where no Jira story exists, the existing test case is used as the requirements proxy — LLM generates BDD / Acceptance Language first.
– Page names extracted from existing test cases by LLM and cross-referenced in `page-registry.json` — QA team normalises and confirms.
– Test case names in Jira are managed and tracked by Claude AI.

##This is not a Phase A concern — no Xray or Jira access exists yet. Full mechanism addressed in Areas 10 and 11. Must be resolved before any production authoring begins.##

## Table of Contents

0. [Session Protocol](#0-session-protocol)
1. [Project Overview](#1-project-overview)
2. [Core Principles](#2-core-principles)
3. [Xray Test Types](#3-xray-test-types)
4. [Confirmed Decisions](#4-confirmed-decisions)
5. [Universal Step Format Library](#5-universal-step-format-library)
6. [Challenges & Solutions Index](#6-challenges--solutions-index)
7. [Open Items & Next Steps](#7-open-items--next-steps)

---

## 1. Project Overview

Generate and maintain Playwright + BDD automation assets from Jira stories and Xray test cases using LLM providers (GitHub Copilot CLI, AI, Bedrock, Anthropic Claude).

– appintest.com is an electronic toll highway in Ontario, Canada. The application is a customer-facing web portal for managing toll accounts, bills, payments, transponders, plates, and account settings. It is a ##legacy application## — documentation is expected to be minimal or non-existent. We have no confirmed access to the application, Jira, or Xray.

##appintest.com is used as the assumed working example only.## Examples referencing appintest.com page names, rules, or flows are illustrative and have not been validated against the actual application. All such examples must be treated as placeholders until live application access is granted and due diligence is completed.

###BASE Application Areas (Observed From UI Screenshots)###

| Area | Pages Observed | Notes |
|------|----------------|-------|
| My Account | My Account page | Account summary, amount due, payment method, bill date, permission |
| Bills & Payments | Bills & Payments page, Missing Payment, Billing History | Billing management |
| Plates & Transponders | T&B | Plate and transponder management |
| Profile | Account page | Account settings |
| Recent Activity | Section within My Account page | Transactions tabs — data, account, activity, charges, payments, download |

##Base Page Inventory above is preliminary and incomplete. Full page discovery requires live application access.

###Features to be Discovered###
– Feature files (DEFICIT)
– Page Object Models using Playwright TypeScript
– Step definitions
– Locators
– Shared utilities
– Fixtures and hooks

---

## 2. Core Principles

FORMAT DOES NOT MATTER/ CONTENT QUALITY IS EVERYTHING.##

The LLM reads whatever format exists in Xray (Manual or Cucumber) and generates clean automation scripts from it. No Xray migration is required. The only thing that determines output quality is whether the test case content is unclear, conflicted, incomplete, and well-structured.##

---

## 3. Xray Test Types

Both formats are valid inputs to the LLM generation pipeline.

| Type | Format | Notes |
|------|--------|-------|
| ##Manual## | Action \| Data \| Expected Result | Most likely format in legacy projects |
| ##Cucumber## | Given / When / Then | Preferred for new test cases going forward |

---

## 4. Confirmed Decisions

All decisions below are ##locked##. Do not revisit unless explicitly agreed.

– Each area file contains the full decision rationale — options considered, option selected, and why each alternative was rejected. MASTER.md holds the summary and pointer only.

| # | Decision | Rule |
|---|----------|------|
| D01 | Page name mandatory | Every step MUST include the page name. No exceptions. |
| D02 | Page name always last | 'on the {PageName} page' is always the final component of every step |
| D03 | Actor always first | 'Actor' is always the first word in every step. Currently always 'User' |
| D04 | Separate file per rule | Each rule gets its own feature file |
| D05 | Page name always in filename | Every feature file is always named by feature file name and test data |
| D06 | Data mandatory in step | All rows contain data values in step text. Always use named parameters e.g. '{amount}' '{email}' |
| D07 | Step in conditional | {PageName} — content value in step text — more than one text on a page |
| D08 | Group files | If more than one file exists, files are grouped in one operating group |
| D09 | Feature file naming | {rule}-{manual}-{feature} e.g. 'account-summary-account-feature' |
| D10 | Xray format only | Xray format in JSON. LLM inspects live DOM during discovery. Fallback: automated Playwright selectors. |
| D11 | Multi-action steps | Multi-action steps are invalid. Any step requiring two formats to express is two steps. Must be split at authoring time. |
| D12 | Implicit flow steps | Flow steps not permitted in scenarios. Flows like login can be collapsed into one step. Must be expressed as atomic steps in Background elements unless D03 permits. |
| D13 | Background step format | Background element locator in DOM. Background container located during Discovery. All forms standard format. |
| D14 | Automation step in steps | Authoring step. Logic Step. Always add explicit steps using standard format. |
| D15 | All steps mandatory | Element discovery exercise required before any authoring begins. Provisional names in Phase A only — reconciled in bulk at first app access. |
| D16 | Authorization step | Authentication written as atomic UI steps in Background. Login all steps in Background using standard format. No hooks or fixtures at this stage. Revisit in Areas 11-14. |
| D17 | Background declarations | Login all steps beginning with 'User ...' are state declarations. No page name background step follows D12. |
| D18 | Element names live in POM only | POM is canonical source for element names and locators. Registry holds page names only. |
| D19 | Some element names across pages | Some element names used on multiple pages. D5/D3 disambiguation via page name in step text. |
| D20 | Generated from DOM inspection | Locators live DOM inspection via Playwright script during discovery. Fallback: automated Playwright selectors. |
| D21 | Multi-action steps are invalid | Any step requiring two formats to express is two steps. Must be split at authoring time. |
| D22 | Implicit flow steps | Flow steps not permitted in scenarios. Flows like login can be collapsed into one step. Must be expressed as atomic steps in Background unless D06 permits. |
| D23 | Background step format | Background container located in DOM during Discovery. All forms standard format. |
| D24 | Registry contains no JSON | Standalone JSON file in repo. LLM reads — never writes. QA team adds additions. |
| D25 | Phase B default — wait | Wait Section unless Application is known or expected from available evidence. |
| D26 | Timeout values in DOM | Background container located during Discovery. For all forms standard format token. |
| D27 | Feature file naming | Feature rule naming format: '{rule}-{manual}-{feature}'. e.g. 'account-summary-account.feature' |

---

## 5. Universal Step Format Library

Seven formats cover all test case types. Every step must follow one of these exactly.

##Component Position Rules

| Position | Component | Rule |
|----------|-----------|------|
| 1 | Actor | Currently always 'User' |
| 2 | Verb | 'should' \| 'clicks' \| 'enters' \| 'selects' \| 'navigates' \| 'should see' |
| 3 | Param | Data — '{amount}' \| '{email}' \| CONSTANTS \| some element exists in list, table, or repeating group |
| 4 | Target | Always last — 'on the {PageName} page' |

###Page format = {rule}-{manual}-{feature} — always at the end###

## 5. Universal Step Format Library

Seven formats cover all test case types. Every step must follow one of these exactly.

##Component Position Rules

| Position | Component | Rule |
|----------|-----------|------|
| 1 | Actor | Currently always 'User' |
| 2 | Verb | 'should' \| 'clicks' \| 'enters' \| 'selects' \| 'navigates' \| 'should see' |
| 3 | Param | Data — '{amount}' \| '{email}' \| CONSTANTS \| some element exists in list, table, or repeating group |
| 4 | Target | Always last — 'on the {PageName} page' |

###Page format = {rule}-{manual}-{feature} — always at the end###

##Step Format — Click / Interaction

```
{verb} clicks the {Element} {Classified} on the {PageName} page
```

---

### Format 4 — Data Entry

**Templates**
```
[Actor] enters [Value] in the [Element] [Section] [Identifier] on the [PageName] page
```

| Variant | Example |
|---------|---------|
| Without optional | `User enters [username] in the Username field on the Login page` |
| With Section | `User enters [amount] in the Payment Amount field in the Payment form on the Make a Payment page` |
| With Identifier | `User enters [amount] in the Amount field in row 1 on the Billing History page` |
| With Both | `User enters [amount] in the Amount field in the Billing section in row 1 on the Billing History page` |

---

### Format 5 — Selection

**Templates**
```
[Actor] selects [Value] from the [Element] [Section] [Identifier] on the [PageName] page
```

| Variant | Example |
|---------|---------|
| Without optional | `User selects [payment-method] from the Payment Method dropdown on the Make a Payment page` |
| With Section | `User selects [payment-method] from the Payment Method dropdown in the Payment form on the Make a Payment page` |
| With Identifier | `User selects [account] from the Account dropdown in the Account Summary section in row 2 on the My Account page` |
| With Both | `User selects [account] from the Account dropdown in the Account Summary section in row 2 on the My Account page` |

---

### Format 6 — State Verification

**Templates**
```
[Actor] should see the [Element] as [State] [Section] [Identifier] on the [PageName] page
```

| Variant | Example |
|---------|---------|
| Without optional | `User should see the Make a Payment button as enabled on the My Account page` |
| With Section | `User should see the Submit button as disabled in the Payment form on the Make a Payment page` |
| With Identifier | `User should see the View link as enabled in row 1 on the Billing History page` |
| With Both | `User should see the Download button as enabled in the Recent Activity section in row 2 on the My Account page` |

---

### Format 7 — Upload

**Templates**
```
[Actor] uploads [Value] in the [Element] [Section] [Identifier] on the [PageName] page
```

| Variant | Example |
|---------|---------|
| Without optional | `User uploads [filename] in the Document field on the Profile page` |
| With Section | `User uploads [filename] in the Document field in the Upload form on the Profile page` |
| With Identifier | `User uploads [filename] in the Attachment field in row 1 on the Billing History page` |
| With Both | `User uploads [filename] in the Attachment field in the Billing section in row 1 on the Billing History page` |

---

## 6. Role & Feature File Standard

### Role Handling Rules

- Role context lives in the Background blocks — NOT in step text
- Steps are always generic: Actor = 'User' regardless of role
- Role is passed via test Credentials, permissions config
- Assertions may reference role-specific outcomes where behaviour differs

> **Note:** Actual roles for appintest.com are unknown until application access is granted. Examples use placeholder role names. Must be updated once confirmed.

### Feature File Naming Convention

**Templates**
```
{role}-{domain}-{feature}.feature
```

| Example | Notes |
|---------|-------|
| `account-owner-my-account.feature` | Account owner viewing their account |
| `account-owner-make-payment.feature` | Account owner making a payment |
| `account-owner-billing-history.feature` | Account owner viewing billing history |

> **WIA. Open Items:** Feature file naming convention may need a `[state]` component to support separate feature files per dynamic page state (D28). e.g., `account-owner-my-account-autopay-enrolled.feature`. To be addressed in Area 7 — Scenario Structure.

### Step Reuse Across Feature Files

| Step | Account Owner | Admin | Guest |
|------|---------------|-------|-------|
| `User clicks the Login page` | REUSED | REUSED | ~ |
| `User clicks the Make a Payment button on the My Account page` | REUSED | REUSED | ~ | ~ |
| `User should see the Amount Due field on the My Account page` | UNIQUE | ~ | ~ |

---

This step appears in multiple feature files but maps to one step definition in the codebase.

---

## 7. Challenges & Solutions Index

This section links to detailed analysis documents for each challenge area.

| # | Challenge Area | Status | File |
|---|----------------|--------|------|
| 1 | Step Text Ambiguity | In Progress | [1-step-text-ambiguity.md](1-step-text-ambiguity.md) |
| 2 | Page & Component Context | Finalized | [2-page-component-context.md](2-page-component-context.md) |
| 3 | Preconditions | In Progress | [3-preconditions.md](3-preconditions.md) |
| 4 | Vocabulary & Naming | Not Started | [4-vocabulary-naming.md](4-vocabulary-naming.md) |
| 5 | N/A — Reserved | — | — |
| 6 | Test Data Handling | Not Started | [6-test-data-handling.md](6-test-data-handling.md) |
| 7 | Scenario Structure | Not Started | [7-scenario-structure.md](7-scenario-structure.md) |
| 8 | Coverage Gaps | Not Started | [8-coverage-gaps.md](8-coverage-gaps.md) |
| 9 | Metadata & Tagging | Not Started | [9-metadata-tagging.md](9-metadata-tagging.md) |
| 10 | Legacy / No Documentation | Not Started | [10-legacy-no-documentation.md](10-legacy-no-documentation.md) |
| 11 | Script Generation — Input | Not Started | [11-script-generation-input.md](11-script-generation-input.md) |
| 12 | Script Generation — Quality | Not Started | [12-script-generation-quality.md](12-script-generation-quality.md) |
| 13 | Script Generation — Architecture | Not Started | [13-script-generation-arch.md](13-script-generation-arch.md) |
| 14 | Script Generation — Long-term Maintenance | Not Started | [14-script-generation-longterm.md](14-script-generation-longterm.md) |

---

## 8. Open Items & Next Steps

| # | Open Item | Next Action |
|---|-----------|-------------|
| 1 | Issue 1.2 — Multiple Actions in One Step | ✅ Finalized |
| 2 | Issue 1.3 — Pronoun Ambiguity | Discuss in Area 1 session |
| 3 | Issue 1.4 — Steps Implying Unknown UI Knowledge | Discuss in Area 1 session |
| 4 | Areas 3-14 not yet started | Work through area by area |
| 5 | Actual appintest.com page inventory unknown | Confirm once application access granted — populate `page-registry.json` |
| 6 | Actual appintest.com roles unknown | Confirm once application and Jira access granted |
| 7 | Actual Xray test case quality unknown | Assess once Xray access granted |
| 8 | Edge case step types (drag/drop, hover, keyboard) | Add as they emerge from application review |
| 9 | Multi-role scenario in one flow not finalized | Confirm if this pattern exists in application |
| 10 | All standards subject to revision | Full review required once access to app, Jira, and Xray is granted |
| 11 | D16 — 'User is ...' keyword provisional | Revisit once application access granted and real Background patterns are known |
| 12 | Area 3 — Background step vs hook: where is the line? | Address in Area 3 — Preconditions session |
| 13 | Area 3 — name vs ID in Background: when does it apply? | Address in Area 3 — Preconditions session |
| 14 | Area 3 — Authentication state: how is it passed? | Confirm once app and Jira access granted — address in Area 3 |
| 15 | Area 3 — Shared Background across feature files: is it supported? | Address in Area 3 — Preconditions session |
| 16 | LLM behaviour when multi-action step detected | Out of scope for Phase B — address in Area 3 — Preconditions session |
| 17 | CD2 — LLM context isolation during generation | Out of scope for Phase B — address in Areas 11-14 before production generation begins |
| 18 | CR3 — Existing test case quality | Out of scope for Phase B — address in Areas 10 and 11. See CR3. |
| 19 | Feature file naming — `[state]` component needed for D28 | Address in Area 7 — Scenario Structure |
| 20 | Element Xray file list is provisional | Extend as needed. Always add to file only. |
| 21 | Model page cases — drawers, sidepanels, full-screen overlays | Apply simple/complex distinction — revisit once app access granted |
| 22 | POM location and namespacing | Automate page object population using out of DOM inspection and Xray test cases using LLM in Areas 11-14 |
| 23 | Area 11 scope — requirements gathering with LLM vs test case path. Not just the test case — automation path. |
| 24 | Authoring reference cards for LLM — deliverable missing | Phase B deliverable — full list of checkable violations with rule reference. Input to Area 11 pre-flight validation |
| 25 | Validation ruleset | Phase B deliverable — full list of checkable violations with rule reference for QA team use alongside Jira stories in D03 phase |
| 26 | Existing Xray test case migration | LLM bulk assessment, triage, rewrite, and regenerate mechanics — address in Areas 10 and 11. See CR3. |

---

**Document maintained by: Senior QA Automation Engineer + Senior AI Engineer**  
**All decisions are rigorous mitigations based on engineering experience.**  
**No access to application, Jira, or Xray at time of writing.**

---

**End of MASTER.md**