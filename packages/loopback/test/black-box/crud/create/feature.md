As a user I want to insert data in my collection

  Scenario: Inserting data into collections 
    Given an app 
    And a controller named NoteController
    And a model named Model
    And a data source named db using a memory connector
    When I make a request to POST /notes
    Then it inserts the data
    And it responds with the id of the new data
    And it has a status code of 200