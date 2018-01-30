# Account Service with Custom MySQL Datasource and Connector

## Summary
A REST API for managing bank accounts.

## Installation
This example requires Node.js 8.x or higher.
Install dependencies:
```
npm i
```

After you've installed your dependencies, you'll need to configure the
`repositories/account/datasources/mysql.json` file to point towards 
your MySQL database.

By default, this example is configured with credentials defined by
loopback-connector-mysql module's `setup.sh` file (which we use for
unit tests).


## Overview

This sample application demonstrates a simple CRUD API for an Account model.
This application does not currently have an explorer component.

Perform a series of CRUD operations using GET, POST, PATCH and DELETE
on the `localhost:3001/accounts` route!

In this example app, the AccountRepository is using a custom MySQL connector
implementation in `repositories/account/datasources/mysqlconn.ts` which
has the methods to run corresponding queries in the underlying database
for the CRUD operations without the use of LoopBack's juggler module.

## Use

Run the app (from the root directory i.e. inside `account-without-juggler`):
```
npm start
```

Use `cURL` or your favourite REST client to access the endpoints!

### Create an Account 

`POST /accounts/create`

Body:
```json
{
"id": "30",
"customerNumber": "600",
"balance": 220,
"branch": "TO",
"type": "Savings",
"avgBalance": 100,
"minimumBalance": 30
}
```

Returns:
```json
{
"id": "30",
"customerNumber": "600",
"balance": 220,
"branch": "TO",
"type": "Savings",
"avgBalance": 100,
"minimumBalance": 30
}
```

### Get Account by ID

`GET /accounts/?filter={"where": {"id": "30"}}`

Returns:
```json
{
"id": "30",
"customerNumber": "600",
"balance": 220,
"branch": "TO",
"type": "Savings",
"avgBalance": 100,
"minimumBalance": 30
}
```

You can also filter by other fields by changing the value of the where filter
in the above example. If you specify an empty filter (i.e. `{}`), you will get
all the account instances in the database.

### Update Account by ID

`PATCH /accounts/update?id=30`
Body:
```json
{
  "customerNumber": "601"
}
```

Returns:
```json
{
  "count": 1
}
```

### Delete an Account by ID

`DELETE /accounts/delete?id=30`

Returns:
```json
{
  "count": 1
}
```

## Tests
Run tests with `npm test`!

## What's Next?
Now that you've got a working example to play with, you can try to
implement your own custom connector using other databases such as
MsSQL or Oracle or improve this example.