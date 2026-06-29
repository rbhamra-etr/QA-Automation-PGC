@api @toll-rate
Feature: Toll Rate API Validation

  Validates the ETR Toll Rate Calculator API returns correct zone breakdowns,
  rates per zone/time-band/direction, and aggregate toll calculations for all
  vehicle classes across weekday, weekend, and statutory holiday scenarios.

  Background:
    Given the Toll Rate API is available

  # ---------- CLASS 1 ----------
  @class1
  Scenario Outline: Class 1 toll rate calculation — <description>
    When I request toll rate for entry "<entry>" exit "<exit>" class "1" at "<timestamp>"
    Then the API response status should be 200
    And the zone breakdown should match expected zones for entry "<entry>" and exit "<exit>"
    And each zone rate should match the rate chart for class "1"
    And each zone toll should equal rate multiplied by distance
    And etr_toll should equal the sum of all zone tolls
    And etr_distance should equal the sum of all zone distances
    And etr_rate should equal etr_toll divided by etr_distance
    And total_transponder should equal etr_toll plus east_toll plus ttc
    And total_video should equal etr_toll plus east_toll plus ttc plus vtc

    Examples:
      | entry | exit | timestamp                  | description                                        |
      | 1     | 5    | 2026-01-01T11:12:00.000Z   | Holiday (New Year) eastbound midday                |
      | 5     | 1    | 2026-01-01T18:29:00.000Z   | Holiday (New Year) westbound pmPeak                |
      | 14    | 33   | 2026-02-16T08:37:00.000Z   | Holiday (Family Day) eastbound amPeak              |
      | 33    | 14   | 2026-02-16T17:55:00.000Z   | Holiday (Family Day) westbound pmPeak              |
      | 10    | 37   | 2026-04-03T06:03:00.000Z   | Holiday (Good Friday) eastbound earlyAM            |
      | 37    | 10   | 2026-04-03T20:44:00.000Z   | Holiday (Good Friday) westbound pmPeak             |
      | 5     | 19   | 2026-05-18T12:29:00.000Z   | Holiday (Victoria Day) eastbound midday            |
      | 19    | 5    | 2026-05-18T21:12:00.000Z   | Holiday (Victoria Day) westbound evening           |
      | 14    | 44   | 2026-07-01T10:55:00.000Z   | Holiday (Canada Day) eastbound midday              |
      | 44    | 14   | 2026-07-01T18:37:00.000Z   | Holiday (Canada Day) westbound pmShoulder2         |
      | 1     | 44   | 2026-04-08T08:44:00.000Z   | Weekday eastbound amPeak full route                |
      | 44    | 1    | 2026-04-08T16:29:00.000Z   | Weekday westbound pmPeak full route                |
      | 7     | 24   | 2026-04-12T19:12:00.000Z   | Weekend eastbound pmPeak                           |
      | 24    | 7    | 2026-04-12T21:55:00.000Z   | Weekend westbound evening                          |

  # ---------- CLASS 2 ----------
  @class2
  Scenario Outline: Class 2 toll rate calculation — <description>
    When I request toll rate for entry "<entry>" exit "<exit>" class "2" at "<timestamp>"
    Then the API response status should be 200
    And the zone breakdown should match expected zones for entry "<entry>" and exit "<exit>"
    And each zone rate should match the rate chart for class "2"
    And each zone toll should equal rate multiplied by distance
    And etr_toll should equal the sum of all zone tolls
    And etr_distance should equal the sum of all zone distances
    And etr_rate should equal etr_toll divided by etr_distance
    And total_transponder should equal etr_toll plus east_toll plus ttc
    And total_video should equal etr_toll plus east_toll plus ttc plus vtc

    Examples:
      | entry | exit | timestamp                  | description                                        |
      | 1     | 5    | 2026-01-01T11:12:00.000Z   | Holiday (New Year) eastbound midday                |
      | 5     | 1    | 2026-01-01T18:29:00.000Z   | Holiday (New Year) westbound pmPeak                |
      | 14    | 33   | 2026-02-16T08:37:00.000Z   | Holiday (Family Day) eastbound amPeak              |
      | 33    | 14   | 2026-02-16T17:55:00.000Z   | Holiday (Family Day) westbound pmPeak              |
      | 1     | 44   | 2026-04-08T08:44:00.000Z   | Weekday eastbound amPeak full route                |
      | 44    | 1    | 2026-04-08T16:29:00.000Z   | Weekday westbound pmPeak full route                |
      | 7     | 24   | 2026-04-12T19:12:00.000Z   | Weekend eastbound pmPeak                           |
      | 24    | 7    | 2026-04-12T21:55:00.000Z   | Weekend westbound evening                          |

  # ---------- CLASS 3 ----------
  @class3
  Scenario Outline: Class 3 toll rate calculation — <description>
    When I request toll rate for entry "<entry>" exit "<exit>" class "3" at "<timestamp>"
    Then the API response status should be 200
    And the zone breakdown should match expected zones for entry "<entry>" and exit "<exit>"
    And each zone rate should match the rate chart for class "3"
    And each zone toll should equal rate multiplied by distance
    And etr_toll should equal the sum of all zone tolls
    And etr_distance should equal the sum of all zone distances
    And etr_rate should equal etr_toll divided by etr_distance
    And total_transponder should equal etr_toll plus east_toll plus ttc
    And total_video should equal etr_toll plus east_toll plus ttc plus vtc

    Examples:
      | entry | exit | timestamp                  | description                                        |
      | 1     | 5    | 2026-01-01T11:12:00.000Z   | Holiday (New Year) eastbound midday                |
      | 5     | 1    | 2026-01-01T18:29:00.000Z   | Holiday (New Year) westbound pmPeak                |
      | 14    | 33   | 2026-02-16T08:37:00.000Z   | Holiday (Family Day) eastbound amPeak              |
      | 33    | 14   | 2026-02-16T17:55:00.000Z   | Holiday (Family Day) westbound pmPeak              |
      | 1     | 44   | 2026-04-08T08:44:00.000Z   | Weekday eastbound amPeak full route                |
      | 44    | 1    | 2026-04-08T16:29:00.000Z   | Weekday westbound pmPeak full route                |
      | 7     | 24   | 2026-04-12T19:12:00.000Z   | Weekend eastbound pmPeak                           |
      | 24    | 7    | 2026-04-12T21:55:00.000Z   | Weekend westbound evening                          |

  # ---------- CLASS 4 ----------
  @class4
  Scenario Outline: Class 4 toll rate calculation — <description>
    When I request toll rate for entry "<entry>" exit "<exit>" class "4" at "<timestamp>"
    Then the API response status should be 200
    And the zone breakdown should match expected zones for entry "<entry>" and exit "<exit>"
    And each zone rate should match the rate chart for class "4"
    And each zone toll should equal rate multiplied by distance
    And etr_toll should equal the sum of all zone tolls
    And etr_distance should equal the sum of all zone distances
    And etr_rate should equal etr_toll divided by etr_distance
    And total_transponder should equal etr_toll plus east_toll plus ttc
    And total_video should equal etr_toll plus east_toll plus ttc plus vtc

    Examples:
      | entry | exit | timestamp                  | description                                        |
      | 1     | 5    | 2026-01-01T11:12:00.000Z   | Holiday (New Year) eastbound midday                |
      | 5     | 1    | 2026-01-01T18:29:00.000Z   | Holiday (New Year) westbound pmPeak                |
      | 14    | 33   | 2026-02-16T08:37:00.000Z   | Holiday (Family Day) eastbound amPeak              |
      | 33    | 14   | 2026-02-16T17:55:00.000Z   | Holiday (Family Day) westbound pmPeak              |
      | 1     | 44   | 2026-04-08T08:44:00.000Z   | Weekday eastbound amPeak full route                |
      | 44    | 1    | 2026-04-08T16:29:00.000Z   | Weekday westbound pmPeak full route                |
      | 7     | 24   | 2026-04-12T19:12:00.000Z   | Weekend eastbound pmPeak                           |
      | 24    | 7    | 2026-04-12T21:55:00.000Z   | Weekend westbound evening                          |

  # ---------- CLASS 6 ----------
  @class6
  Scenario Outline: Class 6 toll rate calculation — <description>
    When I request toll rate for entry "<entry>" exit "<exit>" class "6" at "<timestamp>"
    Then the API response status should be 200
    And the zone breakdown should match expected zones for entry "<entry>" and exit "<exit>"
    And each zone rate should match the rate chart for class "6"
    And each zone toll should equal rate multiplied by distance
    And etr_toll should equal the sum of all zone tolls
    And etr_distance should equal the sum of all zone distances
    And etr_rate should equal etr_toll divided by etr_distance
    And total_transponder should equal etr_toll plus east_toll plus ttc
    And total_video should equal etr_toll plus east_toll plus ttc plus vtc

    Examples:
      | entry | exit | timestamp                  | description                                        |
      | 1     | 5    | 2026-01-01T11:12:00.000Z   | Holiday (New Year) eastbound midday                |
      | 5     | 1    | 2026-01-01T18:29:00.000Z   | Holiday (New Year) westbound pmPeak                |
      | 14    | 33   | 2026-02-16T08:37:00.000Z   | Holiday (Family Day) eastbound amPeak              |
      | 33    | 14   | 2026-02-16T17:55:00.000Z   | Holiday (Family Day) westbound pmPeak              |
      | 1     | 44   | 2026-04-08T08:44:00.000Z   | Weekday eastbound amPeak full route                |
      | 44    | 1    | 2026-04-08T16:29:00.000Z   | Weekday westbound pmPeak full route                |
      | 7     | 24   | 2026-04-12T19:12:00.000Z   | Weekend eastbound pmPeak                           |
      | 24    | 7    | 2026-04-12T21:55:00.000Z   | Weekend westbound evening                          |
