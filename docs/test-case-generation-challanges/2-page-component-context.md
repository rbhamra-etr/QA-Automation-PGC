# Area 2 — Page & Component Context

> ##Status:## ✅ Finalized
> ##References:## [MASTER.md](./MASTER.md)

---

## Overview

Without page context, step text cannot disambiguate which page's elements are being referenced. This is critical for correct POM selection, locator resolution, and step definition reuse patterns.

---

## Challenges & Solutions

### 2.0 — Inconsistent Page Names

####Challenge

No standard exists for how page names are written in step text. Each author uses different conventions: 'Login page', 'login screen', 'Sign In page', 'Authentication page' — all referring to the same page.

####Impact

- LLM cannot determine if different page names refer to the same page or different pages
- Step definitions cannot be reused — 'on the Login page' vs 'on the Sign In page' are treated as different steps
- POM files proliferate — one per variant name
- Registry becomes unreliable — no single source of truth for page names

####Options Considered

| Option | Description | Why Not Selected |
|--------|-------------|------------------|
| **Freeform naming** | Authors choose page names as they write. LLM normalizes during generation. | LLM cannot reliably detect synonyms. 'Payment page' vs 'Make a Payment page' vs 'Pay Bill page' — are these the same? No confident resolution possible. |
| **Case-insensitive matching** | Registry entries matched case-insensitively. 'login page' = 'Login Page' = 'LOGIN PAGE'. | Solves capitalization only. Does not solve synonym problem: 'Login' vs 'Sign In' vs 'Authentication'. |
| **Registry with aliases** | Registry maps aliases to canonical names. E.g., ['Login', 'Sign In', 'Auth'] → 'Login page'. | Requires exhaustive alias mapping. Every possible synonym must be anticipated. Does not scale. QA team cannot predict all variants. |
| **✅ Hard block on registry** | Page names MUST come from `page-registry.json`. Step is invalid if name not in registry. | Forces discipline at authoring time. Single source of truth. Scales indefinitely. QA team controls naming. |

####Selected Decision: D17 — Page names — hard block

Page names must come from `page-registry.json`. Step is invalid if name not in registry. No exceptions.

####Why

- **Single source of truth** — one canonical name per page
- **Enforceable at authoring time** — prevents bad data from entering Xray
- **Scalable** — no synonym resolution logic required
- **QA team control** — naming authority centralized
- **LLM generation simplified** — exact string match only

---

### 2.1 — Section / Tab / Region Naming

####Challenge

Same element name exists multiple times on one page in different sections. Page name alone insufficient to disambiguate.

####Example

My Account page has:
- Edit button in Account Details section
- Edit button in Payment Method section
- Edit button in Plate Management section

Step text: 'User clicks the Edit button on the My Account page' — which Edit button?

####Impact

- Locator resolution fails — multiple elements match
- Step definition cannot determine correct target
- Tests flaky — may click wrong Edit button depending on page state

####Options Considered

| Option | Description | Why Not Selected |
|--------|-------------|------------------|
| **Unique element names** | Rename elements: 'Edit Account button', 'Edit Payment button', 'Edit Plate button'. | Not realistic. Application uses generic 'Edit' label. Cannot force app to change for test automation. |
| **Index-based selection** | 'User clicks the Edit button (2) on the My Account page'. | Brittle. Index changes if page structure changes. Not human-readable. |
| **✅ Section qualifier** | 'User clicks the Edit button in the Payment Method section on the My Account page'. | Natural language. Resilient to page changes. Human-readable. Maps to DOM structure (section containers). |

####Selected Decision: D07 — Section qualifier when element ambiguous

When same element name exists in multiple sections on one page, add section qualifier: 'in the {Section} section'.

####Why

- **Natural language** — reads like plain English
- **Resilient** — survives page restructuring better than index
- **Maps to DOM** — sections have container locators in POM
- **Optional** — only used when disambiguation needed

---

### 2.2 — Element Type Vocabulary

####Challenge

No controlled vocabulary for element types. Authors use inconsistent terms: 'button', 'btn', 'link', 'hyperlink', 'control', 'field', 'input', 'textbox', 'dropdown', 'select', 'picklist'.

####Impact

- Step text inconsistent across feature files
- LLM cannot determine element type reliably
- Locator strategy unclear — button vs link requires different selectors
- Maintenance difficulty — searching for all buttons requires multiple search terms

####Options Considered

| Option | Description | Why Not Selected |
|--------|-------------|------------------|
| **Freeform naming** | Authors use any term. LLM normalizes during generation. | LLM cannot reliably map synonyms. 'btn' = 'button'? Maybe. 'control' = what? Unknown. |
| **Case-insensitive matching** | 'Button' = 'button' = 'BUTTON'. | Solves capitalization only. Does not solve synonym problem. |
| **✅ Controlled vocabulary** | Mandatory type suffix from approved list. | Forces consistency. Clear semantics. LLM has definitive type. Searchable. |

####Selected Decision: D21 — Element naming format mandatory

All elements MUST use [Descriptor] + [Type] format. Type from controlled vocabulary.

####Controlled Type List

| Type | Usage | Example |
|------|-------|---------|
| button | Clickable button element | Submit button, Cancel button |
| link | Hyperlink / anchor | Sign Out link, Terms link |
| field | Text input | Email field, Password field |
| dropdown | Select / picklist | Country dropdown, Month dropdown |
| checkbox | Checkbox input | Remember Me checkbox |
| radio | Radio button | Payment Type radio |
| tab | Tab navigation | Billing History tab |
| modal | Modal / dialog | Confirmation modal |
| message | Alert / notification | Success message, Error message |

####Why

- **Clear semantics** — element type always known
- **Consistent** — one term per type
- **Locator strategy hint** — button uses button/submit selectors, link uses anchor selectors
- **Searchable** — find all buttons with 'button' search

---

### 2.3 — Multi-Page Components (Header, Footer, Navigation)

####Challenge

Some components appear on every page: header, footer, navigation, logout button. Which page name should be used?

####Example

'User clicks the Logout button' — Logout is in header on every page. Which page?

####Impact

- Inconsistent page name selection across test cases
- Duplicate step definitions (one per page even though element identical)
- POM structure unclear — does header own these elements or does each page?

####Status

🔴 Deferred to Area 4 (Vocabulary & Naming). May require 'Layout' concept or generic 'Application' page name.

---

### 2.4 — Modal and Overlay Context

####Challenge

Modals/overlays appear on top of pages but don't have independent page routes. Should they be treated as 'pages' in step text or as sections?

####Example

Make a Payment modal triggered from My Account page. Contains form with multiple fields and buttons.

Step text options:
1. 'User clicks the Submit button in the Make a Payment modal on the My Account page'
2. 'User clicks the Submit button on the Make a Payment Modal page'

####Impact

- **Option 1** — Modal as section. Step text verbose for complex modals with many elements.
- **Option 2** — Modal as page. Simpler step text but modals don't behave like pages (no URL, no direct navigation).

####Options Considered

| Option | Description | Why Not Selected |
|--------|-------------|------------------|
| **All modals as sections** | Every modal treated as section of parent page. | Simple modals (confirmation alerts) work well. Complex modals (multi-field forms) make step text unreadable. |
| **All modals as pages** | Every modal gets own page name and POM. | Simple modals don't need full page treatment. Over-engineers simple cases. |
| **✅ Simple vs Complex distinction** | Simple modals = Section. Complex modals = Page. | Flexible. Optimizes for both cases. Simple modals stay simple. Complex modals get proper page treatment. |

####Selected Decision: D30 — Two modal types — Section vs page

Simple modals (confirmation, alerts) use Section qualifier in step text. Complex modals (multi-field forms) treated as pages.

####Definition

- **Simple modal**: Single action (OK, Cancel, Confirm). Minimal content. 
  - Treated as section: 'in the {Modal Name} modal'
- **Complex modal**: Multi-field form. Multiple actions. Significant content.
  - Treated as page: 'on the {Modal Name} page'

####Why

- **Optimizes both cases** — simple modals don't need page overhead
- **Step text readability** — complex modals avoid verbose section qualifiers
- **POM structure clarity** — complex modals get dedicated POM file
- **Registry entry only when needed** — simple modals not in registry

---

### 2.5 — Dynamic Page States

####Challenge

Page content changes based on user actions, account state, or data. Same page name, but different UI elements visible.

####Example

My Account page when AutoPay enrolled vs not enrolled. Different sections, buttons, messages.

####Impact

- Page name alone insufficient to identify state
- Element presence unpredictable
- Tests fail when expected element not present

####Options Considered

| Option | Description | Why Not Selected |
|--------|-------------|------------------|
| **State in page name** | 'My Account (AutoPay Enrolled) page' vs 'My Account (Not Enrolled) page'. | Page names proliferate. Registry bloats. State belongs in test data, not page name. |
| **State in step text** | 'User clicks Edit AutoPay button (if enrolled) on My Account page'. | Conditionals in step text unsupported. Gherkin doesn't support if/else. |
| **✅ Separate feature files per state** | `my-account-autopay-enrolled.feature` vs `my-account-no-autopay.feature`. State precondition in Background. | Clean separation. State explicit. Step text stays generic. Feature files grouped by state. |

####Selected Decision: D28 — Dynamic states managed by test data

State expressed via test data and preconditions. Separate feature file per distinct state when UI differs significantly. Step text stays generic.

####Example

```gherkin
# my-account-autopay-enrolled.feature
Feature: My Account — AutoPay Enrolled

Background:
  Given User is logged in as [account-owner]
    And User is enrolled in AutoPay

Scenario: Edit AutoPay settings
  When User clicks the Edit AutoPay button on the My Account page
  Then User should see the AutoPay Settings modal on the My Account page
```

```gherkin
# my-account-no-autopay.feature
Feature: My Account — No AutoPay

Background:
  Given User is logged in as [account-owner]
    And User is not enrolled in AutoPay

Scenario: Enroll in AutoPay
  When User clicks the Enroll in AutoPay button on the My Account page
  Then User should see the AutoPay Enrollment modal on the My Account page
```

####Why

- **Clean separation** — distinct feature files per state
- **Explicit preconditions** — state clear in Background
- **Step text generic** — no state conditionals in steps
- **Test data drives state** — account setup determines which tests run

---

#### 2.5.a — One POM per page — all states

####Challenge

Should each dynamic state get its own POM file?

####Options Considered

| Option | Description | Why Not Selected |
|--------|-------------|------------------|
| **Separate POM per state** | `my-account-autopay.page.ts` vs `my-account-no-autopay.page.ts`. | POM files proliferate. Duplication of shared elements. Maintenance burden. |
| **✅ Single POM — all states** | `my-account.page.ts` contains all elements across all states. | One file per page. All elements in one place. State managed at test data level. |

####Selected Decision: D29 — One POM class per page

Single POM class per page. All elements across all states live in one class. State managed at test data level, not POM level.

####Example

```typescript
// my-account.page.ts
class MyAccountPage extends BasePage {
  // Shared elements — always present
  accountSummarySection = this.page.locator('#account-summary')
  amountDueText = this.page.locator('#amount-due')
  
  // State-specific elements
  editAutoPayButton = this.page.locator('#edit-autopay')  // Only when enrolled
  enrollAutoPayButton = this.page.locator('#enroll-autopay')  // Only when not enrolled
}
```

####Why

- **Single source of truth** — one file per page
- **All elements visible** — no hunting across multiple files
- **State at test level** — preconditions determine which elements present
- **Maintenance simpler** — one file to update

---

### 2.6 — Page Registry Structure

####Challenge

What belongs in `page-registry.json`? Page names only? Sections? Elements? Locators?

####Impact

- Registry bloats if too much data
- Registry insufficient if too little data
- LLM context overload if registry too large

####Options Considered

| Option | Description | Why Not Selected |
|--------|-------------|------------------|
| **Page names + sections + elements** | Everything in registry. | Registry bloats. Duplicate source of truth with POM. Maintenance nightmare. |
| **Page names + sections** | Registry holds pages and sections. Elements in POM. | Still duplication. Sections defined in POM anyway (container locators). |
| **✅ Page names + type only** | Registry holds page names and type (page vs modal). Everything else in POM. | Minimal registry. Single purpose. POM remains source of truth for elements. |

####Selected Decision: D25 — Registry contains page names and type only

No elements, sections, or locators in registry. Everything else lives in POM.

####Registry Schema

```json
{
  "pages": [
    {
      "name": "Login",
      "type": "page"
    },
    {
      "name": "My Account",
      "type": "page"
    },
    {
      "name": "Make a Payment",
      "type": "page"
    }
  ],
  "modals": [
    {
      "name": "Add Payment Method",
      "type": "modal",
      "parentPage": "My Account"
    }
  ]
}
```

####Why

- **Minimal** — registry stays small
- **Single purpose** — page name validation only
- **POM authoritative** — elements, sections, locators live in one place
- **LLM context efficient** — small registry fits in prompt

---

###█ Decision D30 — Two modal types. Simple modals treated as Section. Complex modals treated as pages.

####Challenge

Not all modals are equal. Confirmation alerts vs multi-field forms require different treatment.

####Options Considered

| # | Approach | Description | Registry? | POM? | Step Text |
|---|----------|-------------|-----------|------|-----------|
| 1 | **All modals = Section** | Every modal is '[Section]' of parent page | No | Shared POM with parent | 'in the [ModalName] modal on the [PageName] page' |
| 2 | **All modals = Page** | Every modal is independent page | Yes | Own POM | 'on the [ModalName] page' |
| 3 | **✅ Simple/Complex split** | Simple = Section. Complex = Page. | Complex only | Complex get own POM. Simple shared. | Simple: 'in the [ModalName] modal'. Complex: 'on the [ModalName] page' |

####Selected: #3 — Simple/Complex distinction

####Why Simple modals as Section

- **Minimal content** — OK/Cancel only
- **No dedicated POM needed** — 1-2 elements shared with parent page
- **Step text concise** — section qualifier sufficient
- **No registry entry** — not independently navigable

####Why Complex modals as Page

- **Multi-field forms** — many elements
- **Own POM justified** — cleaner separation
- **Step text simpler** — 'on the Add Payment Method page' cleaner than 'in the Add Payment Method modal on the My Account page'
- **Registry entry** — treated like any page

####Decision D31 — Complex modals registered in 'page-registry.json' with type 'modal'. Simple modals not registered.

####Registry Entry

```json
{
  "name": "Add Payment Method",
  "type": "modal",
  "parentPage": "My Account"
}
```

####Decision D32 — All POM files use '.page.ts' suffix. 'BasePage' has a 'type' property defaulting to 'page'. Complex modal POMs override 'type' to 'modal'.

####Why single suffix

- **Simplifies tooling** — one file pattern
- **Type property carries distinction** — no naming convention needed
- **Consistency** — all page objects same structure

####Example

```typescript
// base.page.ts
class BasePage {
  type: string = 'page'
}
```

```typescript
// add-payment-method.page.ts
class AddPaymentMethodPage extends BasePage {
  type: string = 'modal'
  cardNumberField = this.page.locator('#card-number')
  submitButton = this.page.locator('#submit')
}
```

---

**█End to end alignment█**

| Layer | Page | Complex Modal |
|-------|------|---------------|
| Registry 'type' | 'page' | 'modal' |
| POM file location | `login.page.ts` | `add-payment-method.page.ts` |
| POM class 'type' property | 'page' (default) | 'modal' (override) |
| Step text suffix | 'on the [PageName] page' | 'on the [ModalName] page' |

---

> **Note:** Edge cases — drawers, sidepanels, full-screen overlays — apply the same simple/complex distinction. Flagged as provisional. Revisit once app access granted.

---

## Jira & Xray Touchpoints

| Touchpoint | Tool | Detail |
|------------|------|--------|
| Requirements source | Jira | Story AC may reference page names informally — must be normalised to registry entry when authoring Xray |
| Page names | Both | Must come verbatim from `page-registry.json` — D17/D19. Hard block at point of entry. |
| Element names in steps | Xray | Must follow [Descriptor] + [Type] format from Controlled List — D21. Section qualifier added when same element in multiple places on one page — D07. |
| Registry lookup | Both | LLM reads registry before writing step text. LLM never writes to registry. |
| Dynamic state | Jira + Xray | Account state, page state, filter state expressed as preconditions in Background — not in step text. See D28. |
| Modal context | Xray | Complex modals use page-style step text with registry entry — D30/D31. Simple modals use Section qualifier in step text. |
| Existing test cases | Xray | Page name extraction from existing Xray test cases as raw input to `page-registry.json` — QA team normalises and confirms. See CR3. |

---

## Prevention | Detection | Correction

Applies equally whether test cases are created or updated manually or by LLM.

| Layer | Manual Path | LLM Path |
|-------|-------------|----------|
| **Prevention** | QA team consults `page-registry.json` before writing any page name. Hard block — if name not in registry, stop and request addition from QA team. Element name format card available as reference. | Registry injected as full context in LLM prompt. LLM instructed to use only registry entries as page names and to apply D21 element naming patterns. Modal type checked — simple vs complex at DOM inspection. |
| **Detection** | QA reviewer validates page name against registry during review. Element names checked against [Descriptor] + [Type] pattern. Flags modal references that may require registry entry. | LLM self-validation checks page name against registry. Element naming pattern validation. D21 format violations flagged. Modal classification verified. |
| **Correction** | QA team corrects page name to nearest registry match — QA lead confirms. Element name rewritten to correct format. New page name requests queued for QA team registry review. | LLM correction pass rewrites flagged step. QA team approves rewrite in Xray before test case enters generation pipeline. |

---

### Violation Checklist — Area 2

| Violation | Rule | Example |
|-----------|------|---------|
| Page name missing from step | D1 | 'User clicks the Submit button' |
| Page name not in registry | D17 | 'User clicks Submit on the Payment Screen' — 'Payment Screen' not in registry |
| Page name not verbatim from registry | D19 | 'User clicks the Submit button on the Payment page' — should be 'Make a Payment page' per registry |
| Element type missing | D21 | 'User clicks the Submit on the Login page' — should be 'Submit button' |
| Element name with page context embedded | D22 | 'User clicks the Login Submit button on the Login page' — redundant, page already in step |
| Simple modal treated as page | D30 | 'User clicks OK on the Confirmation Modal page' — should use Section: 'in the Confirmation modal' |
| Complex modal treated as Section | D30/D31 | 'User clicks Submit in the Add Payment Method section on the My Account page' — should be 'on the Add Payment Method page' |

---

## Decisions From This Area

| # | Decision | Rule | Status |
|---|----------|------|--------|
| D07 | Section qualifier when element ambiguous | When same element name exists in multiple sections on one page, add section qualifier: 'in the {Section} section' | Locked |
| D17 | Page names — hard block | Page names must come from `page-registry.json`. Step is invalid if name not in registry. No exceptions. | Locked |
| D18 | Registry pre-population required | App discovery required before any authoring begins. Provisional names in Phase A only — reconciled in bulk at first app access. | Locked |
| D19 | Page names verbatim from registry | Authors copy registry entry exactly. LLM uses exact registry string. No paraphrasing. | Locked |
| D20 | Element names live in POM only | POM is canonical source for element names and locators. Registry holds page names only. | Locked |
| D21 | Element naming format mandatory | All elements MUST use [Descriptor] + [Type] format. Type from Controlled List. | Locked |
| D22 | Same element name across pages | Same element name used on multiple pages. D1/D2 disambiguates via page name in step text. | Locked |
| D23 | POM generated from DOM inspection | Target: live DOM inspection via Playwright discovery script during Discovery. Fallback: automated Playwright validation script. Manual full review not the approach. Full mechanics in Areas 11–13. | Locked |
| D24 | Registry stored as 'page-registry.json' | Standalone JSON file in repo. LLM reads — never writes. QA team adds additions. | Locked |
| D25 | Registry contains page names and type only | No elements, sections, or locators in registry. Everything else in POM. | Locked |
| D26 | Phase B Section default — wait | Wait Section unless Application is known or expected from available evidence. | Locked |
| D27 | Section names and locators in POM | Section container locator defined in POM. Element locators chain from section locator. | Locked |
| D28 | Dynamic states managed by test data | State expressed via test data and preconditions only. Separate feature file per distinct state. Step text stays generic. | Locked |
| D29 | One POM per page. All elements across all states | Single POM class per page. All elements across all states. State managed at test data level. | Locked |
| D30 | Two modal types — Section vs page | Simple modals use '[Section]'. Complex modals treated as pages. | Locked |
| D31 | Complex modals in registry with type 'modal' | Registry 'type' field distinguishes pages from modals. Simple modals not registered. | Locked |
| D32 | Single '.page.ts' suffix = type property carries distinction | All POMs use '.page.ts'. 'BasePage' has a 'type' property defaulting to 'page'. Complex modal POMs override 'type' to 'modal'. | Locked |