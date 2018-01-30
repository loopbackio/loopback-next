# Todo Application with Legacy Juggler

## Summary
A REST API for managing Todo entries.

## Installation
This example requires Node.js 8.x or higher.
Install dependencies:
```
npm i
```

After you've installed your dependencies, you'll need to configure the
`datasource.ts` file to point towards your target database.

By default, this example is configured to use the loopback-connector-mysql
module, with credentials defined by its `setup.sh` file (which we use for
unit tests).

Feel free to install a different connector, and change `datasource.ts` 
accordingly!

## Overview

This sample application demonstrates a simple CRUD API for a Todo list.
This application does not currently have an explorer component.

Perform a series of CRUD operations using GET, POST, PUT, PATCH and DELETE
on the `localhost:<PORT>/todo` route!

Currently, only the title filter is supported:
(ex. `GET localhost:3000/todo?title=foo`)

In this example app, the TodoRepository is using the injected datasource
configuration (which uses the loopback@3.x format) in combination with the
DataSourceConstructor provided by `legacy-juggler-bridge.ts/js`.
Additionally, it injects a loopback@3.x model definition to construct the
Todo model class at runtime.

## Use

Run the app:
```
npm start
```

By default, it will be on port 3000, but you can specify the PORT environment
variable to change this:
```
# There, now it's different!
PORT=3001 npm start
```

Use `curl` or your favourite REST client to access the endpoints!

### Create a Todo 

`POST /todo`

Body:
```json
{
  "title": "Make GUI",
  "body": "So that I don't have to keep using curl to make my todo entries..."
}
```

Returns:
```json
{
  "id": 1,
  "title": "Make GUI",
  "body": "So that I don't have to keep using curl to make my todo entries..."
}
```

### Get Todo by ID

`GET /todo/1`

Returns:
```json
{
  "id": 1,
  "title": "Make GUI",
  "body": "So that I don't have to keep using curl to make my todo entries..."
}
```

### Find Todo by Title

`GET /todo?title=Make%20%GUI`

Returns:

```json
[
  {
    "id": 1,
    "title": "Make GUI",
    "body": "So that I don't have to keep using curl to make my todo entries..."
  },
  {
    "id": 2,
    "title": "Make GUI",
    "body": "Wait, I think I already made this todo... :S"
  },
]
```

### Replace Todo
`PUT /todo/2`
Body:
```json
{
  "title": "Make GUI Shiny",
  "body": "Yeah, definitely a shiny GUI!"
}
```

Returns:
```json
  {
    "id": 2,
    "title": "Make Shiny GUI",
    "body": "Yeah, definitely a shiny GUI!"
  },
```

### Update Todo

`PATCH /todo/2`
Body:
```json
{
  "title": "Make simple GUI"
}
```

Returns:
```
  {
    "id": 2,
    "title": "Make simple GUI",
    "body": "Wait, I think I already made this todo... :S"
  },
```

### Delete a Todo

`DELETE /todo/{id}`

Returns:
```json
{
  "count": 1
}
```

### Delete Todo by Title
`DELETE /todo?title=Make%GUI`

Returns:
```json
{
  "count": 3
}
```

## Tests
Run tests with `npm test`!

## What's Next?
Now that you've got a working example to play with, feel free to
begin hacking on it!
