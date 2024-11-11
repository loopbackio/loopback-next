---
lang: en
title: 'PostgreSQL Connector Tutorial'
keywords:
  LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Connector, PostgreSQL,
  Tutorial
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Connecting-to-PostgreSQL.html
---

# Connecting to PostgreSQL

The following tutorial introduces how to set up PostgreSQL as the data source of
LoopBack 4 applications with
[LoopBack PostgreSQL connector](https://github.com/loopbackio/loopback-connector-postgresql).

## Prerequisites

Before starting this tutorial, make sure you have the following installed:

- Node.js version 10 or higher
- LoopBack 4 CLI; see
  [Getting Started with LoopBack 4](../../Getting-started.md)

## Tutorial - PostgreSQL

### 1. Create a new LoopBack 4 app

Let's use the [LB4 CLI](../../Command-line-interface.md) `lb4 app` to create a
LoopBack 4 application called `MyApp`:

```bash
$ lb4 app
? Project name: my-app
? Project description: postgreSQL connector tutorial
? Project root directory: my-app
? Application class name: MyAppApplication
? Select features to enable in the project (Press <space> to select, <a> to togg
le all, <i> to invert selection)
❯◉ Enable eslint: add a linter with pre-configured lint rules
 ◉ Enable prettier: install prettier to format code conforming to rules
 ◉ Enable mocha: install mocha to run tests
 ◉ Enable loopbackBuild: use @loopback/build helpers (e.g. lb-eslint)
 ◉ Enable editorconfig: add EditorConfig files
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
  id: number;

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

Next, let's create a DataSource `db` using the PostgreSQL connector by the
prompts below:

```bash
$ lb4 datasource
? Datasource name: db
? Select the connector for db:
  ...
  MySQL (supported by StrongLoop)
❯ PostgreSQL (supported by StrongLoop)
  Oracle (supported by StrongLoop)
  ...
? Connection String url to override other settings (eg: postgres://username:pass
word@localhost/database):
? host: localhost
? port: 5432
? user: loopback
? password: [hidden] // example password: pa55w0rd
? database: demo

Datasource Db was created in src/datasources/
```

Under `src/datasources/db.datasource.ts`, we can find the `DbDataSource` class
and the config we just set:

```ts
const config = {
  name: 'db',
  connector: 'postgresql',
  url: '',
  host: 'localhost',
  port: 5432,
  user: 'loopback',
  password: 'pa55w0rd',
  database: 'demo',
};
```

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

### 5. Database migration

LoopBack provides a convenient way to create schemas/tables for our models if we
don't have corresponding schemas defined in the relational database. Once we
created the above artifacts, run the following commands:

**1.** Build the project:

```bash
$ npm run build
```

**2.** Migrate database schemas (alter existing tables):

```bash
$ npm run migrate
```

This would generate the corresponding PostgreSQL table `user` using the metadata
from `User` model via auto-migrate. See
[Database Migration](#database-migration) section below for information.

If you check the database, you should able to see the table `user`.

```
 column_name |          column_default          | data_type
-------------+----------------------------------+-----------
 id          | nextval('user_id_seq'::regclass) | integer
 name        |                                  | text
 hasaccount  |                                  | boolean
```

### 6. Create endpoints and view data using API Explorer

Once we built a [controller](../../Controller.md) with `lb4 controller` to
handle requests:

```bash
$ lb4 controller
? Controller class name: user
Controller User will be created in src/controllers/user.controller.ts

? What kind of controller would you like to generate? REST Controller with CRUD
functions
? What is the name of the model to use with this CRUD repository? User
? What is the name of your CRUD repository? UserRepository
? What is the name of ID property? id
? What is the type of your ID? number
? Is the id omitted when creating a new instance? Yes
? What is the base HTTP path name of the CRUD operations? /users
```

Notice that the id is omitted in the request here because it is autogenerated.

From the project root, start the app:

```bash
$ npm start
```

We can verify what we just created with API Explorer
[http://localhost:3000/explorer/](http://localhost:3000/explorer/).

## Database Migration

As we showed in the previous steps,
[Database migration](../../Database-migrations.md) helps you create relational
database schemas based on definitions of your models. Here are some tips:

- if you make further changes to models, make sure to run `npm run build` before
  running the migrate script again
- `npm run migrate` alters existing tables for you. If you'd like to drop any
  existing schemas, you can do `npm run migrate -- --rebuild`. But notice that
  all the data will be lost.

Please check [Database migration](../../Database-migrations.md) for details.

Besides the basic model metadata, you can also specify part of the database
schema definition via the property definition, which would be mapped to the
database. See
[Data Mapping Properties](https://loopback.io/doc/en/lb4/Model.html#data-mapping-properties).

## Model Discovery

While database migration allows you to migrate models to the DB, LoopBack also
provides a command [`lb4 discover`](../../Discovering-models.md) to generate
models based on schemas from the database. For example, we can try to discover
the `user` table we created previously:

```bash
$ npm run build
$ lb4 discover
? Select the connector to discover  db
? Select the models which to discover  user
? Select a convention to convert db column names(EXAMPLE_COLUMN) to model proper
ty names: Camel case (exampleColumn) (Recommended)
? Overwrite src/models/user.model.ts? overwrite
    force src/models/user.model.ts
   update src/models/index.ts

Models User was created in src/models/
```

As we can see, the newly generated `User` model would contain database specific
details:

```ts
// imports
@model({
  settings: {idInjection: false, postgresql: {schema: 'public', table: 'user'}},
})
export class User extends Entity {
  @property({
    type: 'number',
    required: true, // set this to false if the value is auto-generated by the db
    scale: 0,
    id: 1,
    postgresql: {
      columnName: 'id',
      dataType: 'integer',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'NO',
    },
  })
  id: number;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'name',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'YES',
    },
  })
  name?: string;
  // ...
}
```

These definitions would map to the database as well, see
[Data Mapping Properties](https://loopback.io/doc/en/lb4/Model.html#data-mapping-properties).
