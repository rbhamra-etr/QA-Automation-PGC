@web @smoke
Feature: 407ETR Web Login
  Validate login functionality for the 407ETR web application.

  @positive
  Scenario Outline: Successful login with user ID from feature
    Given I am on the 407ETR login page
    When I sign in to 407ETR using user ID "<user_id>"
    Then I should be redirected to the home page
    And I should see my account dashboard

    Examples:
      | user_id                         |
      | uat200000312547@407langroup.com |
    #  | your_user_id_02 |

  @negative
  Scenario Outline: Login fails with invalid user ID
    Given I am on the 407ETR login page
    When I sign in to 407ETR using "<user_id>" and password "<password>"
    Then I should remain on the login page
    And I should see a login error message

    Examples:
      | user_id         | password |
      | invalid_user_01 | kjhgf    |
