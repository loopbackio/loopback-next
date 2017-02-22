# Feature: Bootstrapping the application

- In order to serve up my API
- As a user
- I want to start the application

## Scenario: with default configs

- Given an application
- And a client
- When I start the application
- And I send a request to GET / from the client
- Then the application responds with HTTP 200
