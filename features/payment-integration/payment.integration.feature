@integration @smoke
Feature: Payment Integration
  As a User
  User wants to process payments end-to-end across web and SAP
  So that User can verify the full payment flow works correctly

  Scenario: End-to-end payment flow from web portal to SAP
    Given User is logged in on Login page of Web
    And User navigates to account settings on Account Settings page of Web
    And User should see account details on Account Settings page of Web
    When User is logged in on Login page of SAP
    And User navigates to Payment Processing on Payment page of SAP
    Then User should be able to post a new payment on Payment page of SAP

