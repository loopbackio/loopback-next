---
lang: en
title: 'Database Migrations'
keywords: LoopBack 4.0
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Database-migrations.html
---

## Overview

In LoopBack, auto-migration helps the user create relational database schemas
based on definitions of their models. Auto-migration can facilitate the
synchronization of the backing database and models so that they match, such as
in cases where the database needs to be changed in order to match the models.
LoopBack offers two ways to do this:

- **Auto-migrate**: Drop schema objects if they already exist and re-create them
  based on model definitions. Existing data will be lost.

- **Auto-update**: Change database schema objects if there is a difference
  between the objects and model definitions. Existing data will be kept.

## Implementation Example

Below is an example of how to implement
[automigrate()](http://apidocs.loopback.io/loopback-datasource-juggler/#datasource-prototype-automigrate)
and
[autoupdate()](http://apidocs.loopback.io/loopback-datasource-juggler/#datasource-prototype-autoupdate),
shown with the
[TodoList](https://loopback.io/doc/en/lb4/todo-list-tutorial.html) example.

Create a new file **src/migrate.ts** and add the following import statement:

```ts
import {DataSource, Repository} from '@loopback/repository';
```

Import your application and your repositories:

```ts
import {TodoListApplication} from './index';
import {TodoRepository, TodoListRepository} from './repositories';
```

Create a function called _dsMigrate()_:

```ts
export async function dsMigrate(app: TodoListApplication) {}
```

In the _dsMigrate()_ function, get your datasource and instantiate your
repositories by retrieving them, so that the models are attached to the
corresponding datasource:

```ts
const ds = await app.get<DataSource>('datasources.db');
const todoRepo = await app.getRepository(TodoRepository);
const todoListRepo = await app.getRepository(TodoListRepository);
```

Then, in the same function, call _automigrate()_:

```ts
await ds.automigrate();
```

This call to automigrate will migrate all the models attached to the datasource
db. However if you want to only migrate some of your models, add the names of
the classes in the first parameter:

```ts
// Migrate a single model
ds.automigrate('Todo');
```

```ts
// Migrate multiple models
ds.automigrate(['Todo', 'TodoList']);
```

The implementation for _autoupdate()_ is similar. Create a new function
_dsUpdate()_:

```ts
export async function dsUpdate(app: TodoListApplication) {
  const ds = await app.get<DataSource>('datasources.db');
  const todoRepo = await app.getRepository(TodoRepository);
  const todoListRepo = await app.getRepository(TodoListRepository);

  await ds.autoupdate();
}
```

The completed **src/migrate.ts** should look similar to this:

```ts
import {DataSource, Repository} from '@loopback/repository';
import {TodoListApplication} from './index';
import {TodoRepository, TodoListRepository} from './repositories';

export async function dsMigrate(app: TodoListApplication) {
  const ds = await app.get<DataSource>('datasources.db');
  const todoRepo = await app.getRepository(TodoRepository);
  const todoListRepo = await app.getRepository(TodoListRepository);

  await ds.automigrate();
}

export async function dsUpdate(app: TodoListApplication) {
  const ds = await app.get<DataSource>('datasources.db');
  const todoRepo = await app.getRepository(TodoRepository);
  const todoListRepo = await app.getRepository(TodoListRepository);

  await ds.autoupdate();
}
```

Finally, in **src/index.ts**, import and call the _dsMigrate()_ or _dsUpdate()_
function:

```ts
import {TodoListApplication} from './application';
import {ApplicationConfig} from '@loopback/core';

// Import the functions from src/migrate.ts
import {dsMigrate, dsUpdate} from './migrate';

export {TodoListApplication};

export async function main(options: ApplicationConfig = {}) {
  const app = new TodoListApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);

  // The call to dsMigrate(), or replace with dsUpdate()
  await dsMigrate(app);
  return app;
}
```
