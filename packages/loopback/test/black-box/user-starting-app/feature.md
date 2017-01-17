As a user I want to start the app

  Scenario: using default configs
    Given a newly scaffolded app
    When I run it
    Then it starts on port 3000

  Scenario: using a custom port
    Given a newly scaffolded app
    And a custom config with port set to 4000
    When I run it
    Then it starts on port 4000
