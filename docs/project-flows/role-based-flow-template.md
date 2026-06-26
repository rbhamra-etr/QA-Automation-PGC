# Role-Based Web Flow Template

## 1. Flow Metadata

- Flow ID:
- Application:
- Module or Area:
- Journey Name:
- Role:
- Priority: High | Medium | Low
- Owner:
- Last Updated:
- Status: Draft | In Review | Ready for Automation | Automated

## 2. Access and Permissions

- Role Description:
- Allowed Pages:
- Restricted Pages:
- Feature Flags or Tenant Constraints:
- Environment Notes:

## 3. Preconditions

- User account state:
- Required test data:
- Browser and device assumptions:
- Authentication state:
- External dependency conditions:

## 4. Mandatory Step Sentence Format

- Every step must end with: `on Page <pagename> of <WebInterface>`
- Preferred actor prefix: `User`
- Keep one action per step. Do not combine actions.

Allowed `<WebInterface>` values only:

- `IAdaptive`
- `Web`
- `SFDC`
- `Appian`
- `SAP`

`IAdaptive` usage constraint:

- `IAdaptive` is for dev work only.
- `IAdaptive` routes only to `SFDC`, `Appian`, and `SAP`.
- Do not use `IAdaptive` to route to `Web`.

Step sentence pattern:

`User <action> <target/details> on Page <pagename> of <WebInterface>`

Routing authoring example:

- `User clicks the SFDC launch tile on Page Home of IAdaptive`
- `User should see the dashboard header on Page Home of SFDC`

## 5. Happy Path Flow Steps

| Step | Page or Component | User Action | Standard Step Sentence | Expected UI Result | Expected Data Result | Evidence Needed |
| --- | --- | --- | --- | --- | --- | --- |
| 1 |  |  | User <action> <target/details> on Page <pagename> of <WebInterface> |  |  |  |
| 2 |  |  | User <action> <target/details> on Page <pagename> of <WebInterface> |  |  |  |
| 3 |  |  | User <action> <target/details> on Page <pagename> of <WebInterface> |  |  |  |

## 6. Field and Component Rules

| Component | Rule Type | Rule Description | Example |
| --- | --- | --- | --- |
|  | Validation |  |  |
|  | Visibility by Role |  |  |
|  | Editability |  |  |

## 7. Negative and Permission Scenarios

| Scenario ID | Scenario Description | Trigger Step Sentence | Expected Error or Behavior | Recovery Behavior |
| --- | --- | --- | --- | --- |
| N1 |  | User <action> <target/details> on Page <pagename> of <WebInterface> |  |  |
| N2 |  | User <action> <target/details> on Page <pagename> of <WebInterface> |  |  |

## 8. Observability and Testability

- Important network calls and endpoints:
- UI events that must be waited for:
- Dynamic content behavior:
- Logging or trace points:
- Screenshot checkpoints:

## 9. Playwright Mapping

| Documented Step | Playwright Intent | Suggested Implementation |
| --- | --- | --- |
| User logs in with role credentials on Page Login of <WebInterface> | Session setup | Use storage state per role or dedicated login helper |
| User navigates to Billing module on Page Dashboard of <WebInterface> | Navigation | `page.goto()` and wait for URL and page anchor |
| User clicks the Approve button on Page Invoice Detail of <WebInterface> | Interaction | `getByRole()` or `getByTestId()` then click |
| User should see success toast on Page Invoice Detail of <WebInterface> | Assertion | `expect(locator).toBeVisible()` or value assertion |
| User should see updated status on Page Invoice List of <WebInterface> | Data assertion | API call check or UI data reload assertion |

Selector strategy guidance:

1. Prefer `getByTestId` for stability.
2. Use semantic role selectors where possible.
3. Avoid brittle CSS chains and text-only selectors for dynamic UIs.

## 10. Automation Packaging

- Suggested feature file path:
- Suggested step definition path:
- Suggested page object path:
- Candidate tags: @web | @sap | @sfdc | @appian | @integration | @smoke

## 11. Risks and Open Questions

- Known risks:
- Unknown dependencies:
- Clarifications needed:

## 12. Review Checklist

- [ ] Role access is verified with product owner.
- [ ] Preconditions are reproducible.
- [ ] Steps are unambiguous, testable, and end with the mandatory suffix.
- [ ] Expected results are observable.
- [ ] Negative scenarios are captured.
- [ ] Selector strategy is realistic.
- [ ] No unresolved blockers remain.
