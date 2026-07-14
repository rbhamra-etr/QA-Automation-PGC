Feature: Request Fasteners from Billing Account Requests menu

  @smoke @access @positive
  Scenario Outline: Authorized roles can see "Request Fasteners" in BA Requests dropdown
    Given I am logged into "SFDC" as "<role>"
    When I search for a Billing Account "<ba_name>" using Global Search
    And I open the Billing Account record
    And I click the "Requests" tab or dropdown
    Then I should see "Request Fasteners" in the Requests options
    

    Examples:
      | role | ba_name      |
      | CSR  | 200002844586 |
    #  | OTP             | BA-10001 |
    #  | Digital Support | BA-10001 |

  @access @negative
  Scenario Outline: Unauthorized roles cannot see "Request Fasteners" in BA Requests dropdown
    Given I am logged into "SFDC" as "<role>"
    When I search for a Billing Account "<ba_name>" using Global Search
    And I open the Billing Account record
    And I click the "Requests" tab or dropdown
    Then I should not see "Request Fasteners" in the Requests options

    Examples:
      | role              | ba_name  |
      | HR                | BA-10001 |
      | Financial Analyst | BA-10001 |

  @customer @regression
  Scenario Outline: Existing behavior remains available from Customer page for authorized roles
    Given I am logged into "SFDC" as "<role>"
    When I search for a Customer "<customer_name>" using Global Search
    And I open the Customer record
    And I click the "Requests" tab or dropdown
    Then I should see "Request Fasteners" in the Requests options

    Examples:
      | role            | customer_name |
      | CSR             | Customer A    |
      | OTP             | Customer A    |
      | Digital Support | Customer A    |
