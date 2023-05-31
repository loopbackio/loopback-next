# @loopback/sequelize

This is a loopback4 extension that provides Sequelize's query builder at
repository level in any loopback 4 application. It has zero learning curve as it
follows similar interface as `DefaultCrudRepository`. For relational databases,
Sequelize is a popular ORM of choice.

For pending features, refer to the [Limitations](#limitations) section below.

## Stability: ⚠️Experimental⚠️

> Experimental packages provide early access to advanced or experimental
> functionality to get community feedback. Such modules are published to npm
> using `0.x.y` versions. Their APIs and functionality may be subject to
> breaking changes in future releases.

## Installation

To install this extension in your Loopback 4 project, run the following command:

```sh
npm install @loopback/sequelize
```

You'll also need to install the driver for your preferred database:

```sh
# One of the following:
npm install --save pg pg-hstore # Postgres
npm install --save mysql2
npm install --save mariadb
npm install --save sqlite3
npm install --save tedious # Microsoft SQL Server
npm install --save oracledb # Oracle Database
```

## Usage

> You can watch a video overview of this extension by
> [clicking here](https://youtu.be/ZrUxIk63oRc).

<!-- tutorial-start -->

Both newly developed and existing projects can benefit from the extension by
simply changing the parent classes in the target Data Source and Repositories.

### Step 1: Configure DataSource

Change the parent class from `juggler.DataSource` to `SequelizeDataSource` like
below.

```ts
// ...
import {SequelizeDataSource} from '@loopback/sequelize';

// ...
export class PgDataSource
  extends SequelizeDataSource
  implements LifeCycleObserver {
  // ...
}
```

`SequelizeDataSource` accepts commonly used config in the same way as LoopBack
did. So in most cases you won't need to change your existing configuration. But
if you want to use sequelize specific options pass them in `sequelizeOptions`
like below:

```ts
let config = {
  name: 'db',
  connector: 'postgresql',
  sequelizeOptions: {
    username: 'postgres',
    password: 'secret',
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false,
        ca: fs.readFileSync('/path/to/root.crt').toString(),
      },
    },
  },
};
```

> Note: Options provided in `sequelizeOptions` will take priority over others,
> For example, if you have password specified in both `config.password` and
> `config.password.sequelizeOptions` the latter one will be used.

### Step 2: Configure Repository

Change the parent class from `DefaultCrudRepository` to
`SequelizeCrudRepository` like below.

```ts
// ...
import {SequelizeCrudRepository} from '@loopback/sequelize';

export class YourRepository extends SequelizeCrudRepository<
  YourModel,
  typeof YourModel.prototype.id,
  YourModelRelations
> {
  // ...
}
```

## Relations

### Supported Loopback Relations

With `SequelizeCrudRepository`, you can utilize following relations without any
additional configuration:

1. [HasMany Relation](https://loopback.io/doc/en/lb4/HasMany-relation.html)
2. [BelongsTo Relation](https://loopback.io/doc/en/lb4/BelongsTo-relation.html)
3. [HasOne Relation](https://loopback.io/doc/en/lb4/HasOne-relation.html)
4. [HasManyThrough Relation](https://loopback.io/doc/en/lb4/HasManyThrough-relation.html)
5. [ReferencesMany Relation](https://loopback.io/doc/en/lb4/ReferencesMany-relation.html)

The default relation configuration, generated using the
[lb4 relation](https://loopback.io/doc/en/lb4/Relation-generator.html) command
(i.e. inclusion resolvers in the repository and property decorators in the
model), remain unchanged.

### INNER JOIN

> Check the demo video of using inner joins here:
> https://youtu.be/ZrUxIk63oRc?t=76

When using `SequelizeCrudRepository`, the `find()`, `findOne()`, and
`findById()` methods accept a new option called `required` in the include
filter. Setting this option to `true` will result in an inner join query that
explicitly requires the specified condition for the child model. If the row does
not meet this condition, it will not be fetched and returned.

An example of the filter object might look like this to fetch the books who
contains "Art" in their title, which belongs to category "Programming":

```json
{
  "where": {"title": {"like": "%Art%"}},
  "include": [
    {
      "relation": "category",
      "scope": {
        "where": {
          "name": "Programming"
        }
      },
      "required": true // 👈
    }
  ]
}
```

## SQL Transactions

A Sequelize repository can perform operations in a transaction using the
`beginTransaction()` method.

### Isolation levels

When you call `beginTransaction()`, you can optionally specify a transaction
isolation level. It support the following isolation levels:

- `Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED` (default)
- `Transaction.ISOLATION_LEVELS.READ_COMMITTED`
- `Transaction.ISOLATION_LEVELS.REPEATABLE_READ`
- `Transaction.ISOLATION_LEVELS.SERIALIZABLE`

### Options

Following are the supported options:

```ts
{
  autocommit?: boolean;
  isolationLevel?: Transaction.ISOLATION_LEVELS;
  type?: Transaction.TYPES;
  deferrable?: string | Deferrable;
  /**
   * Parent transaction.
   */
  transaction?: Transaction | null;
}
```

### Example

```ts
// Get repository instances. In a typical application, instances are injected
// via dependency injection using `@repository` decorator.
const userRepo = await app.getRepository(UserRepository);

// Begin a new transaction.
// It's also possible to call `userRepo.dataSource.beginTransaction` instead.
const tx = await userRepo.beginTransaction({
  isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
});

try {
  // Then, we do some calls passing this transaction as an option:
  const user = await userRepo.create(
    {
      firstName: 'Jon',
      lastName: 'Doe',
    },
    {transaction: tx},
  );

  await userRepo.updateById(
    user.id,
    {
      firstName: 'John',
    },
    {transaction: tx},
  );

  // If the execution reaches this line, no errors were thrown.
  // We commit the transaction.
  await tx.commit();
} catch (error) {
  // If the execution reaches this line, an error was thrown.
  // We rollback the transaction.
  await tx.rollback();
}
```

Switching from loopback defaults to sequelize transaction is as simple as
[this commit](https://github.com/shubhamp-sf/loopback4-sequelize-transaction-example/commit/321791c93ffd10c3af13e8b891396ae99b632a23)
in
[loopback4-sequelize-transaction-example](https://github.com/shubhamp-sf/loopback4-sequelize-transaction-example).

<!-- tutorial-end -->

## Debug strings reference

There are three built-in debug strings available in this extension to aid in
debugging. To learn more about how to use them, see
[this page](https://loopback.io/doc/en/lb4/Setting-debug-strings.html).

<table>
  <tbody>
    <tr>
      <th>String</th>
      <th>Description</th>
    </tr>
    <tr>
      <th colspan="2">Datasource</th>
    </tr>
    <tr>
      <td>loopback:sequelize:datasource</td>
      <td>Database Connections logs</td>
    </tr>
    <tr>
      <td>loopback:sequelize:queries</td>
      <td>Logs Executed SQL Queries and Parameters</td>
    </tr>
    <tr>
      <th colspan="2">Repository</th>
    </tr>
    <tr>
      <td>loopback:sequelize:modelbuilder</td>
      <td>Logs Translation of Loopback Models Into Sequelize Supported Definitions. Helpful When Debugging Datatype Issues</td>
    </tr>
  </tbody>
</table>

## Limitations

Please note, the current implementation does not support the following:

1. Loopback Migrations (via default `migrate.ts`). Though you're good if using
   external packages like
   [`db-migrate`](https://www.npmjs.com/package/db-migrate).

Community contribution is welcome.

## Contributions

- [Guidelines](https://github.com/loopbackio/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/loopbackio/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/loopbackio/loopback-next/graphs/contributors).

## License

[MIT](https://github.com/loopbackio/loopback-next/blob/master/LICENSE)
