As a user I want to start the app

  Scenario: using default configs
    Given a newly scaffolded app
    When I run it
    Then it starts on port 3000
