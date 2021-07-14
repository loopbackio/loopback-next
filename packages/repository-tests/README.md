# @loopback/repository-tests

A test suite verifying functionality of `@loopback/repository` in a
connector-independent way.

## Overview

The module provides test-suite factories to define standardized test suite
capable of testing any combination of a Repository class and a corresponding
connector, for example `DefaultCrudRepository` with connectors like `memory`,
`mysql` and `mongodb`.

## Installation

```sh
npm install --save @loopback/repository-tests
```

## Basic use

Add the following file to your test suite, and make the following changes:

- Replace `DefaultCrudRepository` with the repository class you want to test.
- Replace the string `'memory'` with the default export of the connector to use,
  e.g. `require('loopback-connector-mysql')`.
- If your database uses string primary keys (e.g. GUID/UUID), then change
  `idType` to `'string'`.

```ts
import {DefaultCrudRepository} from '@loopback/repository';
import {
  CrudRepositoryCtor,
  crudRepositoryTestSuite,
} from '@loopback/repository-tests';

describe('DefaultCrudRepository + memory connector', () => {
  crudRepositoryTestSuite(
    {
      connector: 'memory',
      // add any database-specific configuration, e.g. credentials & db name
    },
    // Workaround for the following TypeScript error
    //   Type 'DefaultCrudRepository<T, ID, {}>' is not assignable to
    //     type 'EntityCrudRepository<T, ID, Relations>'.
    // See https://github.com/microsoft/TypeScript/issues/31840
    DefaultCrudRepository as CrudRepositoryCtor,
    {
      idType: 'number',
    },
  );
});
```

## Developer guide

Under the hood, the test suite is composed from individual test suite files,
e.g. `src/__tests__/crud/create-retrieve.suite.ts`.

**IMPORTANT** Keep the size of test files small. Each test file should cover a
small & cohesive subset of our features. If a new test does fit the remaining
tests in a test file, then move it to a new one.

A test suite file exports a single factory function that's called to define the
tests:

```ts
export function createRetrieveSuite(
  dataSourceOptions: DataSourceOptions,
  repositoryClass: CrudRepositoryCtor,
  features: CrudFeatures,
) {
  // test code
}
```

The factory functions can use `describe`, `it` and other Mocha API like
`before`/`after` hooks to define the tests to be executed.

Besides the arguments passed to the factory function, the test context (`this`
provided by Mocha) is initialized with additional properties like
`this.dataSource` (a data-source instance created with `dataSourceOptions` to be
used by tests).

Because accessing Mocha's `this` in a type-safe way is cumbersome, we have a
helper converting `this` to a named function argument. Example usage:

```ts
let repo: EntityCrudRepository<Product, typeof Product.prototype.id>;
before(
  withCrudCtx(async function setupRepository(ctx: CrudTestContext) {
    repo = new repositoryClass(Product, ctx.dataSource);
    await ctx.dataSource.automigrate(Product.name);
  }),
);
```

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT

```

```
