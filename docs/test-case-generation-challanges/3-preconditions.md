# Area 3 — Preconditions

> **Status:** 🟡 In Progress
> **References:** [MASTER.md](./MASTER.md)

---

## Overview

Area 1 established that login and session setup must be expressed as atomic UI steps in Background (D15-D15). Area 2 established that dynamic page states are driven by test data and preconditions — not step text (D28). Area 3 is the direct consequence: if Background and preconditions are doing this much work, the rules governing them must be precise.

This area defines:
- Where the line is between a Background step and a hook
- When the page name rule applies inside Background
- How authentication state is passed
- How shared Background is managed across feature files without duplication

> **Note:** D15 defers hooks and fixtures to Areas 11-14. Area 3 defines the principled rules — not the hook architecture.

---

## Decision Documentation Standard

Every decision in this file records:
- **Options considered** — with a one-liner description of what each option means
- **Selected** — which option was chosen
- **Why** — brief reasoning including why other options were rejected

---

## Challenges & Solutions

### 3.1 — Background Step vs Hook: Where Is the Line? 🟡 In Progress

| | |
|---|---|
| **Challenge** | Not everything that runs before a scenario is a Background step. Background is visible, authored Gherkin — part of the test specification. Hooks and fixtures are Infrastructure — run programmatically. The LLM must know which is which. Without a clear rule, it either puts infrastructure into Background (making it verbose), or generates hooks that duplicate what Background already handles. |
| **Impact** | LLM generates feature files with setup steps that cannot be mapped to standard formats, or generates hooks that duplicate what Background already handles, or generates hooks entirely; express all setup in Background; anything that does not belong in a hook — deferred to Areas 11-14. |

#### Decision D33 — Background step vs hook: standard format test applies.

| | |
|---|---|
| **Options considered** | **Standard format tests** — if a step can be written in one of the seven formats, it belongs in Background. If it cannot, it belongs in a hook. **State declarations** — "User is ..." steps authored in Background; anything that does not belong in Background, **State declarations + UI actions** — "User is ..." or "User does ..." both belong in Background. **All rules** — defined by D14/D16 & not clearly & named exception. Everything else cannot be Background. **All rules defined by D14/D16 + state declarations** as an explicit third category, either the step maps to one of seven formats or it does not. That is a binary check the LLM can apply without ambiguity. State declarations are already defined by D14/D16. |
| **Selected** | The Standard Format test is mechanical — either a step maps to one of seven formats or it does not. That is a binary check the LLM can apply without ambiguity. State declarations are already defined by D14/D16. |
| **Why** | Standard format test vs with state declarations as an explicit third category, either the step maps to one of seven formats or it does not. That is a binary check the LLM can apply without ambiguity. State declarations are already defined by D14/D16 as infrastructure format. |

**All rules:**

| Category | Rule | Where It Lives |
|---|---|---|
| Standard format step (formats 1-7) | Can be expressed using a format from the Universal Step Format Library. | Background |
| State declaration ('User is ...') | Declares precondition state — D14/D16. Not a standard format step. | Background |
| Everything else | Cannot be expressed as a standard format. No UI representation. No test intent. E.g. Section. Art calls, browser config, | Hook / Fixture — deferred to Areas 11-14. |

**Before vs Aftertag**

...

❌ BEFORE (infrastructure in Background):
Background:
  Given a test account exists in the database
  And the account has an outstanding balance of [amount]
  And User navigates to the Login page
  And User enters {username} in the Username field on the Login page

🟢 AFTER (infrastructure in hook — deferred; Background has UI steps only):
Background:
  Given User is authenticated as [account-owner-with-balance]
  And User navigates to the Login page
  And User enters {username} in the Username field on the Login page ← state declaration (D1A)
  And User enters {password} in the Password field on the Login page ← Format 3
  And User clicks the Submit button on the Login page ← Format 4
                                                      ← Format 1

**How the hook is called:**

The tag on the Xray test case / feature file is the bridge between the Gherkin layer and the hook. The Background steps have no knowledge of the hook. The hook has no knowledge of the Background steps.

```typescript
// hooks/account.hooks.ts

Before({ tags: '@needs-balance-account' }, async function () {
  await api.createAccountWithBalance({
    username: testData.accountOwnerWithBalance.username,
    balance: testData.accountOwnerWithBalance.balance
  })
})

After({ tags: '@needs-balance-account' }, async function () {
  await api.deleteAccountWithBalance({
    username: testData.accountOwnerWithBalance.username,
    balance: testData.accountOwnerWithBalance.balance
  })
})
```

...

Test runner reads feature file
- Test tag @needs-balance-account on the feature
- Fires Before hook registered for @needs-balance-account
- API reads account with balance
- Background steps run (UI login flow)
- Scenario steps run
- After hook fires → state reset

...

> **Note:** Hook tag vocabulary ('@needs-balance-account' etc.) must be defined as a controlled list. Freeform hook tags produce the same inconsistency problem as freeform page names. Tag vocabulary to be defined in Area 9 — Metadata & Tagging.

---

### 3.2 — Page Name Rule in Background: When Does It Apply? 🔴 Pending

| | |
|---|---|
| **Challenges** | TBD |
| **Solutions** | TBD |

---

### 3.3 — Authentication State: How Is It Passed? 🔴 Pending

| | |
|---|---|
| **Challenges** | TBD |
| **Solutions** | TBD |

---

### 3.4 — Shared Background Across Feature Files: How to Avoid Duplication? 🔴 Pending

| | |
|---|---|
| **Challenges** | TBD |
| **Solutions** | TBD |

---

## Jira & Xray Touchpoints

| Touchpoint | Tool | Detail |
|---|---|---|
| Requirements source | Jira | Story AC defines the account state required before a test runs — this becomes the precondition. AC must state role, account state, and starting condition clearly. State must be distinguishable. |
| Precondition issue | Xray | Background steps live in a dedicated Xray Precondition Issue — written once, linked to multiple test cases. Avoids Background duplication across test cases. |
| State declarations | Xray | 'Given User is ...' steps authored in Xray Precondition — D14/D16 |
| Authentication steps | Xray | 'User ... login steps' authored in Xray Precondition — D1-D7 |
| Hook tags | Xray | Labels on Xray Test Issue — trigger Before/After hooks at runtime — D33 |
| Account state | Jira, Account | Account state originally from Jira AC. Expressed as test data identifier in Xray Precondition step text — D28. Never hardcoded — D6. |
| hook tag vocabulary | Xray | Controlled tag list to be defined in Area 9. Tags authored as Xray labels. |

---

## Prevention | Detection | Correction

Applies equally whether test cases are created or updated manually or by LLM.

| Layer | Manual Path | LLM Path |
|---|---|---|
| **Prevention** | QA team uses Background authoring reference — state declarations vs UI steps clearly distinguished. Precondition written as Xray LLM directed to place infrastructure setup as hook tags only — not as Background steps. Xray Precondition Issue created as separate output from scenario steps. | D33 = D14-D16 injected as prompt constraints. scenario steps. |
| **Detection** | QA team detects during review: any step that cannot be mapped to a standard format or a 'User is ...' declaration is flagged as misplaced infrastructure. Hook tags checked against controlled vocabulary. | LLM validation pass every Background step — applies standard format test. Flags steps with no format match as 'User is ...' prefix. Flags hook tags not in controlled vocabulary. |
| **Correction** | Misplaced infrastructure step removed from Background and hook tag added. LLM rewrite flagged step from Background, adds hook tag to feature file, tags hook requirement for Areas 11-14. QA team confirms rewrite. |

---

### Violation Checklist — Area 3

| Violation | Rule | Example |
|---|---|---|
| Infrastructure step in Background | D33 | 'Given test account exists in the database' **in Background** |
| State declaration inside scenario | D14 | 'Given User is authenticated as [account-owner]' **inside Scenario** |
| Authentication step in Xray Steps | D15/D15 | 'Given User is authenticated as [account-owner]' **inside Xray Steps block** |
| Hardcoded credentials in Background | D6 | 'User enters john@email.com in the Username field on the Login page' |
| Hook tag not from controlled vocabulary | Area 9 | '@this-is-needed' instead of '@needs-balance-account' |

---

## Decisions From This Area

| # | Decision | Rule | Status |
|---|---|---|---|
| D33 | Background step vs hook — standard format test | A step action belongs in Background if it can be expressed using a format from the Universal Step Format Library, or if it is a state declaration ('User is ...'). Anything that cannot clear either bar belongs in a hook or fixture — deferred to Areas 11-14. | Locked |