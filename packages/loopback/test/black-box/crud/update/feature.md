As a user I want to update data in my collection

  Scenario: Updating collection data
    Given an app 
    And a controller named NoteController
    And a model named Model
    And a data source named db using a memory connector
    And a record in the data source with id 123 and name of foo
    When I make a request to PATCH /notes/123 with name of bar
    Then it modifies the record with id 123 to have a name of bar
    And it has a status code of 200