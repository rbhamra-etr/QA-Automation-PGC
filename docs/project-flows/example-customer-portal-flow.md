# Example: Customer Portal - Billing Analyst - Approve Invoice

## 1. Flow Metadata

- Flow ID: CP-BILL-ANALYST-APPROVE-001
- Application: Customer Portal
- Module or Area: Billing
- Journey Name: Approve Pending Invoice
- Role: Billing Analyst
- Priority: High
- Owner: QA Automation
- Last Updated: 2026-06-24
- Status: Ready for Automation

## 2. Access and Permissions

- Role Description: Billing Analyst can review and approve invoices up to threshold.
- Allowed Pages: Dashboard, Invoice List, Invoice Detail
- Restricted Pages: User Administration, Tenant Settings
- Feature Flags or Tenant Constraints: Invoice approval feature enabled
- Environment Notes: UAT tenant with seeded invoice data

## 3. Preconditions

- User account state: Active analyst user with MFA complete
- Required test data: One pending invoice under approval threshold
- Browser and device assumptions: Desktop Chromium 1366x768
- Authentication state: Logged in with analyst role
- External dependency conditions: Billing service healthy

## 4. Happy Path Flow Steps

| Step | Page or Component | User Action | Standard Step Sentence | Expected UI Result | Expected Data Result | Evidence Needed |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Dashboard | Open Billing module | User opens the Billing module on Page Dashboard of Customer Portal | Billing side nav and invoice widgets appear | None | Screenshot of module landing |
| 2 | Invoice List | Filter status = Pending | User selects Pending from the Status filter on Page Invoice List of Customer Portal | Table shows pending invoices only | Filter query applied | Screenshot of filtered grid |
| 3 | Invoice List | Select first pending invoice | User clicks the first pending invoice row on Page Invoice List of Customer Portal | Invoice detail panel opens | Selected invoice id retained | Screenshot with invoice id |
| 4 | Invoice Detail | Click Approve | User clicks the Approve button on Page Invoice Detail of Customer Portal | Success toast appears | Invoice status set to Approved | Screenshot of toast + status |
| 5 | Invoice List | Refresh list | User refreshes the invoice list on Page Invoice List of Customer Portal | Approved invoice no longer in pending filter | Persisted status confirmed | Screenshot after refresh |

## 5. Field and Component Rules

| Component | Rule Type | Rule Description | Example |
| --- | --- | --- | --- |
| Approve button | Visibility by Role | Visible only for Billing Analyst and Supervisor | Hidden for Viewer role |
| Approval comment | Validation | Optional but max 250 chars | Error shown above limit |
| Status badge | Data display | Reflects latest server state | Pending to Approved |

## 6. Negative and Permission Scenarios

| Scenario ID | Scenario Description | Trigger Step Sentence | Expected Error or Behavior | Recovery Behavior |
| --- | --- | --- | --- | --- |
| N1 | Viewer tries approval | User clicks the Approve button on Page Invoice Detail of Customer Portal | Access denied message and no status change | Redirect to read-only view |
| N2 | Analyst approves stale invoice | User clicks the Approve button on Page Invoice Detail of Customer Portal | Conflict toast shown | Refresh detail and show latest status |

## 7. Observability and Testability

- Important network calls and endpoints: GET /invoices, POST /invoices/{id}/approve
- UI events that must be waited for: table reload after approval
- Dynamic content behavior: status badge updates after API success
- Logging or trace points: approval transaction id in response payload
- Screenshot checkpoints: before approval, after toast, after refresh

## 8. Playwright Mapping

| Documented Step | Playwright Intent | Suggested Implementation |
| --- | --- | --- |
| Login as Billing Analyst | Session setup | Reuse analyst storage state fixture |
| Open Billing module | Navigation | `page.goto('/billing')` then assert heading |
| Filter Pending invoices | Interaction | Select status filter and apply |
| Approve invoice | Interaction + assertion | Click approve and assert success toast |
| Verify status persistence | Assertion | Reload and verify invoice not in pending list |

Suggested locator examples:

- `page.getByTestId('invoice-status-filter')`
- `page.getByRole('button', { name: 'Approve' })`
- `page.getByTestId('toast-success')`

## 9. Automation Packaging

- Suggested feature file path: features/web/invoice-approval.web.feature
- Suggested step definition path: step-definitions/web/invoice-approval.web.steps.ts
- Suggested page object path: pages/web/invoice.web.page.ts
- Candidate tags: @web @smoke

## 10. Risks and Open Questions

- Known risks: flaky backend response time during peak hours
- Unknown dependencies: approval threshold from external policy service
- Clarifications needed: should approval comment be mandatory for high-value invoices

## 11. Review Checklist

- [x] Role access is verified with product owner.
- [x] Preconditions are reproducible.
- [x] Steps are unambiguous and testable.
- [x] Expected results are observable.
- [x] Negative scenarios are captured.
- [x] Selector strategy is realistic.
- [x] No unresolved blockers remain.
