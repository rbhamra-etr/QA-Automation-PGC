@sfdc @smoke
Feature: SFDC Case Management
  As a User
  User wants to manage customer cases in Salesforce
  So that User can track and resolve customer issues

  Scenario: Agent can view open cases
    Given User is logged in on Login page of SFDC
    When User navigates to Cases list view on Cases page of SFDC
    Then User should see open cases on Cases page of SFDC

