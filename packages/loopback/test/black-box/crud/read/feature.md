As a user I read data from my collection

  Scenario: Reading collection data
    Given an app 
    And a controller named NoteController
    And a model named Model
    And a data source named db using a memory connector
    And a record in the data source with id 1
    And a record in the data source with id 2
    When I make a request to GET /notes
    Then it responds with an array of 2 records
    And one record has id 1
    And another item has id 2
    And it has a status code of 200