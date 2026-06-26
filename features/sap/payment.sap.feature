@sap
Feature: SAP Payment Processing
  As a User
  User wants to process customer payments in SAP
  So that User can reconcile accounts accurately

  Scenario: User can post a customer payment
    Given User is logged in on Login page of SAP
    When User navigates to Payment Processing on Payment page of SAP
    Then User should be able to post a new payment on Payment page of SAP

