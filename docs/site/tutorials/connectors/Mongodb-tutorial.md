---
lang: en
title: 'MongoDB connector tutorial'
keywords:
  LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, connector, MongoDB
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Connecting-to-MongoDB.html
---

# Connecting to MongoDB

The following tutorial introduces how to set up MongoDB as the data source of
LoopBack 4 applications with
[LoopBack MongoDB connector](https://github.com/strongloop/loopback-connector-mongodb).

## Prerequisites

Before starting this tutorial, make sure you have the following installed:

- Node.js version 10 or higher
- LoopBack 4 CLI; see
  [Getting Started with LoopBack 4](../../Getting-started.md)

## Tutorial - MongoDB

### 1. Create a new LoopBack 4 app

Let's use the [LB4 CLI](../../Command-line-interface.md) `lb4 app` to create a
LoopBack 4 application called `MyApp`:

```bash
$ lb4 app
? Project name: my-app
? Project description: MongoDB connector tutorial
? Project root directory: my-app
? Application class name: MyAppApplication
? Select features to enable in the project (Press <space> to select, <a> to togg
le all, <i> to invert selection)
❯◉ Enable eslint: add a linter with pre-configured lint rules
 ◉ Enable prettier: install prettier to format code conforming to rules
 ◉ Enable mocha: install mocha to run tests
 ◉ Enable loopbackBuild: use @loopback/build helpers (e.g. lb-eslint)
 ◉ Enable vscode: add VSCode config files
 ◉ Enable docker: include Dockerfile and .dockerignore
 ◉ Enable repositories: include repository imports and RepositoryMixin
(Move up and down to reveal more choices)
```

### 2. Create models

Let's create a simple model `User`. To keep the tutorial short, the prompts of
`lb4 model` are skipped:

{% include code-caption.html content="user.model.ts" %}

```ts
// imports
@model()
export class User extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'boolean',
    required: true,
  })
  hasAccount: boolean;

  constructor(data?: Partial<User>) {
    super(data);
  }
}
```

### 3. Create a data source

Next, let's create a DataSource `db` using the MongoDB connector by the prompts
below:

```bash
$ lb4 datasource
? Datasource name: db
? Select the connector for db:
  ...
  Redis key-value connector (supported by StrongLoop)
❯ MongoDB (supported by StrongLoop)
  MySQL (supported by StrongLoop)
  ...
? Connection String url to override other settings (eg: mongodb://username:passw
ord@hostname:port/database):
? host: localhost
? port: 27017
? user:
? password: [hidden]
? database: demo
? Feature supported by MongoDB v3.1.0 and above: Yes

Datasource Db was created in src/datasources/
```

Under `src/datasources/db.datasource.ts`, we can find the `DBDataSource` class
and the config we just set:

```ts
const config = {
  name: 'db',
  connector: 'mongodb',
  url: '',
  host: 'localhost',
  port: 27017,
  user: '',
  password: '',
  database: 'demo',
};
```

{% include important.html content="please make sure you are using `loopback-connector-mongodb` package version 5.2.1
or above to handle `ObjectId` properly." %}

### 4. Create repositories

A [Repository](../../Repository.md) is an artifact that ties the model and the
datasource. We will need to create the repository for the `User` class to access
the database. The steps of creating `UserRepository` by running `lb4 repository`
are skipped here:

{% include code-caption.html content="user.repository.ts" %}

```ts
// imports
export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(User, dataSource);
  }
}
```

### 5. Create endpoints and view data using API Explorer

Once we built a [controller](../../Controllers.md) with `lb4 controller` to
handle requests, from the project root, start the app:

```bash
$ npm start
```

We can verify what we just created with API Explorer
[`http://localhost:3000/explorer/`](http://localhost:3000/explorer/).

## Data Mapping Properties

If you'd like to use different names for the collection/fields and the
model/properties, it can be achieved by configuring the model
definition/property definition. Take the `User` model as an example, if we'd
like to name the collection as `MY_USER` in the database and also use uppercase
for properties `name` and `hasAccount`, the following settings would allow us to
do so:

```ts
@model({
  settings: {
    // add it to the model definition
    mongodb: {collection: 'MY_USER'},
  },
})
export class User extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id: string;

  @property({
    type: 'string',
    // add it to the property definition
    mongodb: {
      fieldName: 'NAME',
    },
  })
  name?: string;

  @property({
    type: 'boolean',
    required: true,
    // add it to the property definition
    mongodb: {
      fieldName: 'HASACCOUNT',
    },
  })
  hasAccount: boolean;
}
```

{% include important.html content="Since in MongoDB `_id` is reserved for the primary key, LoopBack **does not** allow customization of the field name for the id property. Please use `id` as is." %}

## Handling ObjectId

MongoDB uses `ObjectId` for its primary key, which is an object instead of a
string. In queries, string values must be cast to ObjectID, otherwise they are
not considered as the same value. Therefore, you might want to specify the data
type of properties to enforce ObjectId coercion. Such coercion would make sure
the property value converts from ObjectId-like string to `ObjectId` when it
accesses to the database and converts `ObjectId` to ObjectId-like string when
the app gets back the value.

Please check section
[Handling ObjectId](https://loopback.io/doc/en/lb4/MongoDB-connector.html#handling-objectid)
for details.
