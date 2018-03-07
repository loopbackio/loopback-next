---
lang: en
title: 'Repositories'
keywords: LoopBack 4.0, LoopBack 4
tags:
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Repositories.html
summary:
---
A Repository is a type of _Service_ that represents a collection of data within a DataSource.



## Example Application
You can look at [the account application as an example.](https://github.com/strongloop/loopback-next-example/tree/master/services/account)

## Installation
Legacy juggler support has been enabled in `loopback-next` and can be imported from the `@loopback/repository` package. In order to do this, save `@loopback/repository` as a dependency in your application.

You can then install your favorite connector by saving it as part of your application dependencies.

## Repository Mixin
`@loopback/repository` provides a mixin for your Application that enables convenience methods that automatically bind repository classes for you. Repositories declared by components are also bound automatically.

Repositories are bound to `repositories.${ClassName}`. See example below for usage.
```ts
import { Application } from '@loopback/core';
import { RepositoryMixin } from '@loopback/repository';
import { AccountRepository, CategoryRepository } from './repository';

// Using the Mixin
class MyApplication extends RepositoryMixin(Application) {}


const app = new MyApplication();
// AccountRepository will be bound to key `repositories.AccountRepository`
app.repository(AccountRepository);
// CategoryRepository will be bound to key `repositories.CategoryRepository`
app.repository(CategoryRepository);
```

## Configure datasources

You can define a DataSource using legacy Juggler in your LoopBack 4 app as follows:

```js
import {juggler, DataSourceConstructor} from '@loopback/repository';

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

Models are defined as regular JavaScript classes. If you want your model to be persisted in a database, your model must have an `id` property and inherit from `Entity` base class.

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
import {
  Entity,
  model,
  property,
  ModelDefinition
} from '@loopback/repository';

export class Account extends Entity {
  static definition = new ModelDefinition({
    name: 'Account',
    properties: {
      id: {type: 'number', id: true},
      name: {type: 'string', required: true},
    }
  });
}
```

## Define repositories

Use `DefaultCrudRepository` class to create a repository leveraging the legacy juggler bridge and binding your Entity-based class with a datasource you have configured earlier.

TypeScript version:

```ts
import {DefaultCrudRepository} from '@loopback/repository';
import {Account} from '../models/account.model';
import {db} from '../datasources/db.datasource';

export class AccountRepository extends DefaultCrudRepository<
  Account,
  typeof Account.prototype.id
> {
  constructor() {
    super(Account, db);
  }
}
```

JavaScript version:

```ts
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

Once your DataSource is defined for your repository, all the CRUD methods you call in your repository will use Juggler and your connector's methods unless you overwrite them. In your controller, you will need to define a repository property and create a new instance of the repository you configured your DataSource for in the constructor of your controller class as follows:

```js
export class AccountController {
  constructor(
    @inject('repositories.account')
    public repository: AccountRepository
  ) {}
}
```

### Defining CRUD methods for your application

When you want to define new CRUD methods for your application, you will need to modify the API Definitions and their corresponding methods in your controller. Here are examples of some basic CRUD methods:
1. Create API Definition:
```javascript
'/accounts/create': {
  post: {
    'x-operation-name': 'createAccount',
    parameters: [
      {
        name: 'accountInstance',
        in: 'body',
        description: 'The account instance to create.',
        required: true,
        type: 'object'
      },
    ],
    responses: {
      200: {
        schema: {
          accountInstance: "#/definitions/Account"
        },
      },
    },
  },
}
```
Create Controller method:
```javascript
async createAccount(accountInstance) {
  return await this.repository.create(accountInstance);
}
```
2. Find API Definition:
```javascript
'/accounts': {
  get: {
    'x-operation-name': 'getAccount',
    parameters: [
      {
        name: 'filter',
        in: 'query',
        description: 'The criteria used to narrow down the number of accounts returned.',
        required: false,
        type: 'object'
      }
    ],
    responses: {
      200: {
        schema: {
          type: 'array',
          items: '#/definitions/Account'
        },
      },
    },
  },
}
```
Find Controller method:
```javascript
async getAccount(filter) {
  return await this.repository.find(JSON.parse(filter));
}
```
3. Update API Definition:
```javascript
'/accounts/update': {
  post: {
    'x-operation-name': 'updateAccount',
    parameters: [
      {
        name: 'where',
        in: 'query',
        description: 'The criteria used to narrow down the number of accounts returned.',
        required: true,
        type: 'object'
      },
      {
        name: 'data',
        in: 'body',
        description: 'An object of model property name/value pairs',
        required: true,
        type: 'object'
      }
    ],
    responses: {
      200: {
        schema: {
          type: 'object',
          description: 'update information',
          properties: {
            count: {
              type: 'number',
              description: 'number of records updated'
            }
          }
        },
      },
    },
  },
}
```
Update Controller method:
```javascript
async updateAccount(where, data) {
  return await this.repository.update(JSON.parse(where), data);
}
```

Please See [Testing Your Application](Testing-Your-Application.md) section in order to set up and write unit, acceptance, and integration tests for your application.

## Persisting Data without Juggler [Using MySQL database]
LoopBack 4 gives you the flexibility to create your own custom Datasources which utilize your own custom connector for your favourite back end database. You can then fine tune your CRUD methods to your liking.

### Example Application
You can look at [the account-without-juggler application as an example.](https://github.com/strongloop/loopback-next-example/tree/master/services/account-without-juggler)

### Steps to create your own concrete DataSource

1. Implement the `CrudConnector` interface from `@loopback/repository` package. [Here is one way to do it](https://github.com/strongloop/loopback-next-example/blob/master/services/account-without-juggler/repositories/account/datasources/mysqlconn.ts)
2. Implement the `DataSource` interface from `@loopback/repository`. To implement the `DataSource` interface, you must give it a name, supply your custom connector class created in the previous step, and instantiate it:
    ```javascript
    export class MySQLDs implements DataSource {
      name: 'mysqlDs'
      connector: MySqlConn
      settings: Object

      constructor() {
        this.settings = require('./mysql.json'); //connection configuration
        this.connector = new MySqlConn(this.settings);
      }
    }
    ```
3. Extend `CrudRepositoryImpl` class from `@loopback/repository` and supply your custom DataSource and model to it:

    ```javascript
    import { CrudRepositoryImpl } from '@loopback/repository';
    import { MySQLDs } from './datasources/mysqlds';
    import { Account } from './models/Account';

    export class newRepository extends CrudRepositoryImpl<Account, string> {
      constructor() {
        let ds = new MySQLDs();
        super(ds, Account);
      }
    }
    ```

You can override the functions it provides, which ultimately call on your connector's implementation of them, or write new ones.

### Configure Controller

The next step is to wire your new DataSource to your controller.
This step is essentially the same as above, but can also be done as follows using DI:

1. Bind instance of your repository to a certain key in your application class

    ```javascript
    class AccountMicroservice extends Application {
      private _startTime: Date;

      constructor() {
        super();
        const app = this;
        app.controller(AccountController);
        app.bind('repositories.account').toClass(AccountRepository);
      }
    ```

2. Inject the bound instance into the repository property of your controller. `inject` can be imported from `@loopback/context`.

    ```javascript
    export class AccountController {
      @inject('repositories.account') private repository: newRepository;
    }
    ```

### Example custom connector CRUD methods

Here is an example of a `find` function which uses the node-js `mysql` driver to retrieve all the rows that match a particular filter for a model instance.

```javascript
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
