---
lang: en
title: 'Repositories'
keywords: LoopBack 4.0, LoopBack 4
tags:
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Repositories.html
summary:
---

A Repository is a type of _Service_ that represents a collection of data within
a DataSource.

## Example Application

You can look at
[the account application as an example.](https://github.com/strongloop/loopback4-example-microservices/tree/master/services/account)

## Installation

Legacy juggler support has been enabled in `loopback-next` and can be imported
from the `@loopback/repository` package. In order to do this, save
`@loopback/repository` as a dependency in your application.

You can then install your favorite connector by saving it as part of your
application dependencies.

## Repository Mixin

`@loopback/repository` provides a mixin for your Application that enables
convenience methods that automatically bind repository classes for you.
Repositories declared by components are also bound automatically.

Repositories are bound to `repositories.${ClassName}`. See example below for
usage.

```ts
import {Application} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {AccountRepository, CategoryRepository} from './repositories';

// Using the Mixin
class MyApplication extends RepositoryMixin(Application) {}

const app = new MyApplication();
// AccountRepository will be bound to key `repositories.AccountRepository`
app.repository(AccountRepository);
// CategoryRepository will be bound to key `repositories.CategoryRepository`
app.repository(CategoryRepository);
```

## Configure datasources

You can define a DataSource using legacy Juggler in your LoopBack 4 app as
follows:

```ts
// src/datsources/db.datasource.ts
import {juggler, DataSourceConstructor} from '@loopback/repository';

// this is just an example, 'test' database doesn't actually exist
export const db = new DataSourceConstructor({
  connector: 'mysql',
  host: 'localhost',
  port: 3306,
  database: 'test',
  password: 'pass',
  user: 'root',
});
```

## Define models

Models are defined as regular JavaScript classes. If you want your model to be
persisted in a database, your model must have an `id` property and inherit from
`Entity` base class.

TypeScript version:

```ts
import {Entity, model, property} from '@loopback/repository';

@model()
export class Account extends Entity {
  @property({id: true})
  id: number;

  @property({required: true})
  name: string;
}
```

JavaScript version:

```js
import {Entity, ModelDefinition} from '@loopback/repository';

export class Account extends Entity {}

Account.definition = new ModelDefinition({
  name: 'Account',
  properties: {
    id: {type: 'number', id: true},
    name: {type: 'string', required: true},
  },
});
```

## Define repositories

Use `DefaultCrudRepository` class to create a repository leveraging the legacy
juggler bridge and binding your Entity-based class with a datasource you have
configured earlier. It's recommended that you use
[Dependency Injection](Dependency-injection.md) to retrieve your datasource.

TypeScript version:

```ts
import {DefaultCrudRepository, DataSourceType} from '@loopback/repository';
import {inject} from '@loopback/context';
import {Account} from '../models';

export class AccountRepository extends DefaultCrudRepository<
  Account,
  typeof Account.prototype.id
> {
  constructor(@inject('datasources.db') protected db: DataSourceType) {
    super(Account, db);
  }
}
```

JavaScript version:

```js
import {DefaultCrudRepository} from '@loopback/repository';
import {Account} from '../models/account.model';
import {db} from '../datasources/db.datasource';

export class AccountRepository extends DefaultCrudRepository {
  constructor() {
    super(Account, db);
  }
}
```

### Controller Configuration

Once your DataSource is defined for your repository, all the CRUD methods you
call in your repository will use the Juggler and your connector's methods unless
you overwrite them. In your controller, you will need to define a repository
property and create a new instance of the repository you configured your
DataSource for in the constructor of your controller class as follows:

```ts
export class AccountController {
  constructor(
    @repository(AccountRepository) public repository: AccountRepository,
  ) {}
```

### Defining CRUD methods for your application

When you want to define new CRUD methods for your application, you will need to
modify the API Definitions and their corresponding methods in your controller.
Here are examples of some basic CRUD methods:

1. Create API Definition:

```json
{
  "/accounts/create": {
    "post": {
      "x-operation-name": "createAccount",
      "requestBody": {
        "description": "The account instance to create.",
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object"
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Account instance created",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Account"
              }
            }
          }
        }
      }
    }
  }
}
```

Create Controller method:

```ts
async createAccount(accountInstance: Account) {
  return await this.repository.create(accountInstance);
}
```

2. Find API Definition:

```json
{
  "/accounts": {
    "get": {
      "x-operation-name": "getAccount",
      "responses": {
        "200": {
          "description": "List of accounts",
          "content": {
            "application/json": {
              "schema": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Account"
                }
              }
            }
          }
        }
      }
    }
  }
}
```

Find Controller method:

```ts
async getAccount() {
  return await this.repository.find();
}
```

Don't forget to register the complete version of your OpenAPI spec through
`app.api()`.

Please See [Testing Your Application](Testing-Your-Application.md) section in
order to set up and write unit, acceptance, and integration tests for your
application.

## Persisting Data without Juggler [Using MySQL database]

{% include important.html content="This section has not been updated and code
examples may not work out of the box.
" %}

LoopBack 4 gives you the flexibility to create your own custom Datasources which
utilize your own custom connector for your favorite back end database. You can
then fine tune your CRUD methods to your liking.

### Example Application

You can look at
[the account-without-juggler application as an example.](https://github.com/strongloop/loopback-next-example/tree/master/services/account-without-juggler)

<!--lint enable no-duplicate-headings -->

1. Implement the `CrudConnector` interface from `@loopback/repository` package.
   [Here is one way to do it](https://github.com/strongloop/loopback-next-example/blob/master/services/account-without-juggler/repositories/account/datasources/mysqlconn.ts)

2. Implement the `DataSource` interface from `@loopback/repository`. To
   implement the `DataSource` interface, you must give it a name, supply your
   custom connector class created in the previous step, and instantiate it:

   ```ts
   export class MySQLDs implements DataSource {
     name: 'mysqlDs';
     connector: MySqlConn;
     settings: Object;

     constructor() {
       this.settings = require('./mysql.json'); // connection configuration
       this.connector = new MySqlConn(this.settings);
     }
   }
   ```

3. Extend `CrudRepositoryImpl` class from `@loopback/repository` and supply
   your custom DataSource and model to it:

   ```ts
   import {CrudRepositoryImpl} from '@loopback/repository';
   import {MySQLDs} from './datasources/mysqlds.datasource';
   import {Account} from './models/account.model';

   export class NewRepository extends CrudRepositoryImpl<Account, string> {
     constructor() {
       const ds = new MySQLDs();
       super(ds, Account);
     }
   }
   ```

You can override the functions it provides, which ultimately call on your
connector's implementation of them, or write new ones.

### Configure Controller

The next step is to wire your new DataSource to your controller. This step is
essentially the same as above, but can also be done as follows using Dependency
Injection:

1. Bind instance of your repository to a certain key in your application class

   ```ts
   class AccountMicroservice extends Application {
     private _startTime: Date;

     constructor() {
       super();
       const app = this;
       app.controller(AccountController);
       app.bind('repositories.NewRepository').toClass(NewRepository);
     }
   ```

2. Inject the bound instance into the repository property of your controller.
   `inject` can be imported from `@loopback/context`.

   ```ts
   export class AccountController {
     @repository(NewRepository) private repository: NewRepository;
   }
   ```

### Example custom connector CRUD methods

Here is an example of a `find` function which uses the node-js `mysql` driver to
retrieve all the rows that match a particular filter for a model instance.

```ts
public find(
  modelClass: Class<Entity>,
  filter: Filter,
  options: Options
): Promise<EntityData[]> {
  let self = this;
  let sqlStmt = "SELECT * FROM " + modelClass.name;
  if (filter.where) {
    let sql = "?? = ?";
    let formattedSql = "";
    for (var key in filter.where) {
      formattedSql = mysql.format(sql, [key, filter.where[key]]);
    }
    sqlStmt += " WHERE " + formattedSql;
  }
  debug("Find ", sqlStmt);
  return new Promise<Account[]>(function(resolve, reject) {
    self.connection.query(sqlStmt, function(err: any, results: Account[]) {
      if (err !== null) return reject(err);
      resolve(results);
    });
  });
}
```
