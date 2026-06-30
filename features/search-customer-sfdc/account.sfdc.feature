@sfdc
Feature: SFDC Account Management
  As a User
  User wants to manage customer accounts in Salesforce
  So that User can view and update account information

  Scenario: Agent can search for a customer account
    Given User is logged in on Login page of SFDC
    When User searches for account "407 ETR Test Customer" on Account Search page of SFDC
    Then User should see account record on Account page of SFDC

