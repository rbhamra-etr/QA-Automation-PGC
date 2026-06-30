@sfdc
Feature: SFDC User List
  As a User
  User wants to open SFDC users list
  So that User can verify all users are visible
  # Step 1 (close modal first) is not reliably implemented in automation code yet.

  Scenario: User launches SFDC from IAdaptive
    Given User navigates to IAdaptive access portal on Page Access of IAdaptive
    When User closes modal if visible on Page Access of IAdaptive
    And User launches SFDC application from app tiles on Page Access of IAdaptive
    Then User should see SFDC home page on Page Home of SFDC

  Scenario: User opens users list from setup in SFDC
    Given User is on SFDC home page on Page Home of SFDC
    When User clicks the setup gear icon on Page Home of SFDC
    And User clicks Users item from left navigation on Page Setup Home of SFDC
    And User clicks Users link under Administration section in left navigation on Page Setup Home of SFDC
    And User clicks user list dropdown on Page Setup Home of SFDC
    And User selects All Users from list on Page Setup Home of SFDC
    Then User should see All Users view on Page Setup Home of SFDC
    And User should see list of all users on Page Setup Home of SFDC

