# Project Flows Documentation

## Purpose

Use this folder to document role-based navigation and behavior for any web application in a reusable format.

The output of these documents is designed to be directly convertible into Playwright + Cucumber artifacts.

## Files

- `role-based-flow-template.md`: Reusable template for all applications.
- `example-customer-portal-flow.md`: Filled example using the template.

## When To Use

Create a new flow document whenever:

- A new application module is added.
- A new role is introduced.
- A critical journey changes.

## Recommended Naming

Use one document per role + module + journey.

Pattern:

`<app>-<module>-<role>-<journey>.md`

Examples:

- `billing-invoice-analyst-approve.md`
- `crm-account-manager-edit-profile.md`

## Authoring Process

1. Copy `role-based-flow-template.md` into a new file.
2. Fill scope, role, and access assumptions.
3. Record happy path steps with page, action, expected result, and standard step sentence.
4. Add validations and negative scenarios.
5. Add Playwright mapping details for selectors and assertions.
6. Mark the document as Ready for Automation.

## Step Sentence Standard

Every authored step must end with this exact suffix:

`on Page <pagename> of <WebInterface>`

Example:

`User clicks the Approve button on Page Invoice Detail of Customer Portal`

## Definition Of Ready For Automation

A flow is ready when all are true:

- Role and permissions are clearly defined.
- Preconditions and test data are documented.
- Each step has observable expected behavior and the mandatory step suffix.
- UI elements include stable selector strategy.
- Negative cases and error states are documented.
- Open questions are resolved.

## Playwright Mapping Rule

Each documented step should map to one of these:

- Navigation action
- User interaction action
- Assertion
- API/network wait
- Role/session setup

If a step cannot map cleanly, improve documentation clarity before automating.
