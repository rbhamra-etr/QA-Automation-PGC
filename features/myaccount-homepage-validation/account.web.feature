@web
Feature: Web Account Management
  As a User
  User wants to manage my account details
  So that User can keep my information up to date

  Scenario: User can view account details
    Given User is logged in on Login page of Web
    When User navigates to account settings on Account Settings page of Web
    Then User should see account details on Account Settings page of Web

