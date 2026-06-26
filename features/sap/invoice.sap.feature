@sap @smoke
Feature: SAP Invoice Processing
  As a User
  User wants to process invoices in SAP
  So that User can ensure accurate billing records

  Scenario: User can view pending invoices
    Given User is logged in on Login page of SAP
    When User navigates to Invoice Processing on Invoice page of SAP
    Then User should see pending invoices on Invoice page of SAP

