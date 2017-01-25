As a user I want to delete data from my collection

  Scenario: Deleting data from collections 
    Given an app 
    And a controller named NoteController
    And a model named Model
    And a data source named db using a memory connector
    And a record in the data source with id 123
    When I make a request to DELETE /notes/123
    Then it removes the record with id 123
    And it responds with the number of affected rows set to 1
    And it has a status code of 200