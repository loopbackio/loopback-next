# Spike: Resolve included models

## Table of contents

- [Introduction](#introduction)
- [The problem](#the-problem)
- [Proposed solution](#proposed-solution)
- [Follow-up tasks](#follow-up-tasks)
  - [MVP Scope](#mvp-scope)
  - [Post-MVP](#post-mvp)

## Introduction

Consider the following domain model(s):

- A model called `Category` with properties `id`, `name`.
- A model called `Product` with properties `id`, `name`, `categoryId`
- A `hasMany` relation (Category has many products)

Now consider the following code to retrieve all categories with all related
products (perhaps to render a home page of a product catalog):

```ts
categoryRepo.find({include: [{relation: 'products'}]});
```

## The problem

How to fetch products for each category found?

Additional constraints:

- The target model (`Product`) can be backed by a different database than the
  source model (`Category`). For example, we can use MongoDB to store categories
  and MySQL to store products.

- We need to test relations against real databases to ensure we are correctly
  handling database-specific quirks like:
  - a limit on the number of items that can be included in `inq`
  - coercion between `ObjectID` vs. `string` for MongoDB.

## Proposed solution

### 1. Introduce the concept of `InclusionResolver`

An inclusion resolver is a function that can fetch target models for the given
list of source model instances. The idea is to create a different inclusion
resolver for each relation type.

```ts
/**
 * @returns An array of resolved values, the items must be ordered in the same
 * way as `sourceEntities`. The resolved value can be one of:
 * - `undefined` when no target model(s) were found
 * - `Entity` for relations targeting a single model
 * - `Entity[]` for relations targeting multiple models
 */
export type InclusionResolver = (
  /**
   * List of source models as returned by the first database query.
   */
  sourceEntities: Entity[],
  /**
   * Inclusion requested by the user (e.g. scope constraints to apply).
   */
  inclusion: Inclusion,
  /**
   * Generic options object, e.g. carrying the Transaction object.
   */
  options?: Options,
) => Promise<(Entity | undefined)[] | (Entity[] | undefined)[]>;
```

This signature is loosely aligned with GraphQL resolvers as described e.g. in
[Apollo docs](https://www.apollographql.com/docs/graphql-tools/resolvers/).
While it should be possible to use these resolvers to directly implement GraphQL
resolvers, such implementation would be prone to
[`SELECT N+1` problem](https://stackoverflow.com/q/97197/69868). I did a quick
search and it looks like the recommended solution is to leverage
[DataLoader](https://github.com/graphql/dataloader/) to batch multiple queries
into a single one. DataLoader's example showing integration with GraphQL is not
trivial: https://github.com/graphql/dataloader#using-with-graphql.

As I see it, implementing inclusion resolvers for GraphQL requires further
research that's out of scope of this spike.

### 2. Base repository classes handle inclusions via resolvers

Each repository class (e.g. `DefaultCrudRepository` from our legacy juggler
bridge) should maintain a map containing inclusion resolvers for each relation
that is allowed to be included.

Conceptually:

```ts
export class DefaultCrudRepository {
  public inclusionResolvers: Map<string, InclusionResolver>;

  // ...
}
```

**IMPORTANT:** To support use cases where no custom repository class is created
and applications/extensions are instantiating `DefaultCrudRepository` class
directly, it's important to expose `inclusionResolvers` as a public property.

When a repository method like `find`, `findOne` and `findById` is called to
query the database, it should use use `inclusionResolvers` map to fetch any
related models requested by `filter.include`.

Conceptually:

```ts
export class DefaultCrudRepository<T, Relations> {
  // ...

  async find(
    filter?: Filter<T>,
    options?: Options,
  ): Promise<(T & Relations)[]> {
    const models = await ensurePromise(
      this.modelClass.find(this.normalizeFilter(filter), options),
    );
    const entities = this.toEntities(models);
    // NEW LINE ADDED TO RESOLVE INCLUDED MODELS:
    return this.includeRelatedModels(entities, filter, options);
  }

  protected async includeRelatedModels(
    entities: T[],
    filter?: Filter<T>,
    options?: Options,
  ): Promise<(T & Relations)[]> {
    const result = entities as (T & Relations)[];

    // process relations in parallel
    const resolveTasks = filter.include.map(async i => {
      const relationName = i.relation;
      const resolver = this.inclusionResolvers.get(relationName);
      const targets = await resolver(entities, i, options);

      for (const ix in result) {
        const src = result[ix];
        (src as AnyObject)[relationName] = targets[ix];
      }
    });

    await Promise.all(resolveTasks);

    return result;
  }
}
```

### 3. Model-specific repositories register inclusion resolvers

Model-specific repository classes (e.g. `CategoryRepository`) should register
inclusion resolvers for model relations, similarly to how we are creating
relation-repository factories now.

To make this process easier, relation-repository factories should provide
`inclusionResolver` property containing the appropriate `InclusionResolver`
implementation.

Conceptually:

```ts
export class CategoryRepository extends DefaultCrudRepository {
  products: HasManyRepositoryFactory<Product, typeof Category.prototype.id>;

  constructor(
    dataSource: juggler.DataSource,
    productRepositoryGetter: Getter<ProductRepository>,
  ) {
    super(Category, dataSource);

    // we already have this line to create HasManyRepository factory
    this.products = this.createHasManyRepositoryFactoryFor(
      'products',
      productRepositoryGetter,
    );

    // add this line to register inclusion resolver
    this.registerInclusion('products', this.products.inclusionResolver);
  }
}
```

As we realized in LB3, not all relations are allowed to be traversed. For
example, when fetching users, we don't want the callers to include related
`AccessToken` models in the response!

In the proposed solution, this is solved by NOT REGISTERING any inclusion
resolver for such relation.

In the future, we can implement a "dummy" resolver that will report a helpful
error for such relations (rather than a generic "unknown inclusion" error).

```ts
// usage
this.prohibitInclusion('accessTokens');

// implementation
this.registerInclusion(
  relationName,
  createRejectedInclusionResolver(relationName),
);
```

### 4. Create a shared test suite runnable against different connectors and Repository classes

This has been already done,
[`packages/repository-tests`](https://github.com/strongloop/loopback-next/tree/master/packages/repository-tests)
implements a shared test suite that allows us to run the same set of tests
against different Repository classes (legacy juggler bridge, the new Repository
implementation we will write in the future) and different connectors (memory,
MongoDB, MySQL, etc.)

At the moment, the test suite is executed against:

- `memory` connector (as part of `npm test` in `packages/repository-tests`)
- `mysql` connector - see
  [`acceptance/repository-mysql`](https://github.com/strongloop/loopback-next/tree/master/acceptance/repository-mysql)
- `mongodb` connector - see
  [`acceptance/repository-mongodb`](https://github.com/strongloop/loopback-next/tree/master/acceptance/repository-mongodb)

Please note the shared test suite is very minimal now, we need to beef it up as
part of follow-up stories.

We also need to enhance our connectors to execute this shared test suite (in
addition to juggler v3 and v4 tests), i.e. add `@loopback/repository-tests` to
dev-dependencies and `npm test` of every connector. We should use the same
approach as we did for juggler v3 and v4, so that in the future, we can run
tests for multiple `@loopback/repository-tests` and/or `@loopback/repository`
versions.

Last but not least, let's add Cloudant and PostgreSQL to the connectors tested.

### Edge cases

I have carefully reviewed existing tests in `loopback-datasource-juggler` that
are related to inclusion of resolved models and discovered few edge to consider.

#### Navigational properties in create/update data

In LB3 test suite, we are testing the following scenario:

```js
const found = await Category.findOne({include: ['products']});
found.name = 'new name';
// important: found.products contains a list of related products
await found.save();
// success, found.products was silently ignored
```

Silently ignoring navigational properties turned out to be problematic in
practice. Because the framework does not complain, many users are expecting
related models to be updated as part of the command (e.g. create both `Category`
and related `Products` in a single call).

For LoopBack 4, we decided to change this behavior and reject such requests with
an error.

LB3 test suite:
[loopback-datasource-juggler/test/include.test.js#L104-L141](https://github.com/strongloop/loopback-datasource-juggler/blob/f0a6bd146b7ef2f987fd974ffdb5906cf6a584db/test/include.test.js#L104-L141)

#### Inclusion with custom scope

Besides specifying the relation name to include, it's also possible to specify
additional `scope` constraints:

- custom `order`, `limit`, `skip` and `fields`
- additional `scope.where` constraint

For example, the following filter will include only the first active product:

```js
filter.include = [{
  relation: 'products',
  scope: {
    where: {active: true},
    limit: 1
  }
}
```

I am proposing to leave this feature out of scope of the initial release.
However, we should tell the user when they try to use this feature via a 4xx
error.

LB3 test suite:
[loopback-datasource-juggler/test/include.test.js#L247-L253)](https://github.com/strongloop/loopback-datasource-juggler/blob/f0a6bd146b7ef2f987fd974ffdb5906cf6a584db/test/include.test.js#L247-L253)

#### Recursive inclusion

In LB3, it's possible to recursively include models related to included models.

For example, consider the domain model where `Author` has many `Post` instances
and each `Post` instance has many `Comment` instances.

Users can fetch authors with posts and comments using the following query:

```ts
userRepo.find({
  include: [
    {
      relation: 'posts',
      scope: {
        include: [{relation: 'comments'}],
      },
    },
  ],
});
```

LB3 offer few simpler alternatives how to express the same query:

```ts
userRepo.find({include: {posts: 'comments'}});
userRepo.find({include: {posts: {relation: 'comments'}}});
```

I am proposing to leave recursive inclusion out of scope of the initial release.

LB3 test suite:
[loopback-datasource-juggler/test/include.test.js#L175-L195](https://github.com/strongloop/loopback-datasource-juggler/blob/f0a6bd146b7ef2f987fd974ffdb5906cf6a584db/test/include.test.js#L175-L195)

#### Interaction between `filter.fields` and `filter.include`

The filter property `fields` allows callers to limit which model properties are
returned by the database. This creates a problem when the primary or the foreign
key is excluded from the data, because then we cannot resolve included models.

```ts
categoryRepo.find({
  fields: ['name'],
  include: [{relation: 'products'}],
});
```

In LB3, I think we were silently ignoring `include` filter in such case.

I am proposing to be more explicit in LB4 and reject such queries with a 4xx
(Bad Request) error.

Later, we can improve our implementation to automatically add PK/FK properties
to the `fields` configuration and remove PK/FK properties from the data returned
back to the user, so that inclusions are resolved as expected and yet the data
contains only the specified properties.

#### Syntax sugar for `filter.include`

LB3 supports several different ways how to specify which models to include.

For example:

```ts
userRepo.find({include: ['posts', 'passports']});

userRepo.find({
  include: [
    {relation: 'posts', scope: {where: {title: 'Post A'}}},
    'passports',
  ],
});
```

There is already an issue tracking this feature, see
https://github.com/strongloop/loopback-next/issues/3205

#### Limit on `inq` size

Under the hood, inclusion resolvers are implemented using `inq` operator:

1. Gather PK/FK values from source models.
2. Query target models using `inq` and PK/FK values from step 1.
3. Assign target models to navigational property in source models.

This can be problematic when the number of source instances is large, we don't
know if all databases support `inq` with arbitrary number of items.

To address this issue, LB3 is implementing "inq splitting", where a single query
with arbitrary-sized `inq` condition is split into multiple queries where each
query has a reasonably-sized `inq` condition.

Connectors are allowed to specify the maximum `inq` size supported by the
database via `dataSource.settings.inqLimit` option. By default, `inqLimit` is
set to 256.

I am proposing to preserve this behavior in LB4 too.

However, because our `Repository` interface is generic and does not assume that
a repository has to be backed by a data-source, I am proposing to expose
`inqLimit` via a new property of the `Repository` interface instead of accessing
the parameter via DataSource settings.

```ts
/**
 * Description of capabilities offered by the connector backing the given
 * datasource.
 */
export interface ConnectorCapabilities {
  /**
   * Maximum number of items allowed for `inq` operators.
   * This value is used to split queries when resolving related models
   * for a large number of source instances.
   */
  inqLimit?: number;
}
```

To preserve backwards compatibility with existing repository implementation, we
cannot add `ConnectorCapabilities` directly to the `Repository` class. We need
to introduce a new interface instead that Repositories can (or may not)
implement.

```ts
export interface WithCapabilities {
  capabilities: ConnectorCapabilities;
}
```

#### MongoDB and `ObjectID` type

MongoDB is tricky.

- It uses a custom `ObjectID` type for primary keys.
- `ObjectID` is represented as a `string` when converted to JSON
- In queries, string values must be cast to ObjectID, otherwise they are not
  considered as the same value: `'some-id' !== ObjectID('some-id')`.

As a result, both PK and FK properties must use `ObjectID` as the type, and
coercion must be applied where necessary.

Ideally, I'd like LB4 to define MongoDB PK and FKs as follows:

- `{type: 'string', mongodb: {dataType: 'ObjectID'}}`

Even better, `dataType: 'ObjectID'` should be automatically applied by the
connector for PK and FKs referencing ObjectID PKs.

For example:

```ts
@model()
class Product {
  @property({
    type: 'string',
    generated: true,
    // ^^ implies dataType: 'ObjectID'
  })
  id: string;

  @property({
    type: 'string',
    references: {
      model: () => Category,
      property: 'id',
    },
    // ^^ implies dataType: 'ObjectID' when Category is attached to MongoDB
  })
  categoryId: string;
}
```

For v1, I suppose we can ask developers to provide dataType manually.

```ts
@model()
class Product {
  @property({
    type: 'string',
    generated: true,
    mongodb: {dataType: 'ObjectID'},
  })
  id: string;

  @property({
    type: 'string',
    mongodb: {dataType: 'ObjectID'},
  })
  categoryId: string;
}
```

With this setup in place, `id` and `categoryId` properties should be always
returned as strings from DAO and connector methods.

This is tricky to achieve for the PK property, because juggler overrides
user-supplied type with connector's default type when the PK is generated by the
database. See
[`DataSource.prototype.setupDataAccess()`](https://github.com/strongloop/loopback-datasource-juggler/blob/0c2bb81dace3592ecde8b9eccbd70d589da44d7d/lib/datasource.js#L713-L719)

Can we rework MongoDB connector to hide ObjectID complexity as an internal
implementation detail and always use string values in public APIs? Accept ids as
strings and internally convert them to ObjectID. Convert values returned by the
database from ObjectID to strings.

Downside: this is not going to work for free-form properties that don't have any
type definition and where the connector does not know that they should be
converted from string to ObjectID. But then keep in mind that JSON cannot carry
type information, therefore REST API clients are not able to set free-form
properties to ObjectID values even today.

I encountered this problem while testing `findById` followed by `replaceById`. I
think we can defer this problem for later, as long as we have a test to verify
that `DefaultCrudRepository` is preserving `ObjectID` type where required by the
current architecture.

### Out of scope (not investigated)

LB4 does not support all relation types from LB3, this spike is not covering
them either:

- HasAndBelongsToMany
- ReferencesMany
- polymorphic relations
- embedded relations

LB3 has tests to verify how many database calls are made when resolving related
models, this is important to avoid `SELECT N+1` performance problem. See the
following test cases:

- including belongsTo should make only ' + nDBCalls + ' db calls'
  https://github.com/strongloop/loopback-datasource-juggler/blob/f0a6bd146b7ef2f987fd974ffdb5906cf6a584db/test/include.test.js#L1317
- including hasManyThrough should make only 3 db calls'
  https://github.com/strongloop/loopback-datasource-juggler/blob/f0a6bd146b7ef2f987fd974ffdb5906cf6a584db/test/include.test.js#L1340
- including hasMany should make only ' + dbCalls + ' db calls'
  https://github.com/strongloop/loopback-datasource-juggler/blob/f0a6bd146b7ef2f987fd974ffdb5906cf6a584db/test/include.test.js#L1395
- should not make n+1 db calls in relation syntax'
  https://github.com/strongloop/loopback-datasource-juggler/blob/f0a6bd146b7ef2f987fd974ffdb5906cf6a584db/test/include.test.js#L1431

I was not trying to reproduce these tests in my spike, but I think we should
include them as part of the test suite for each inclusion resolver.

## Follow-up tasks

I am proposing to split the scope in two parts:

1. A minimal viable product (MVP, the initial release)
2. Improvements to be implemented later, possibly based on user demand

### MVP Scope

#### Run repository tests for PostgreSQL

Add `acceptance/repository-postgresql` package, modelled after MySQL tests in
`acceptance/repository-mysql`. The tests should be run as a new Travis CI job,
see the existing setup for other connectors.

#### Run repository tests for Cloudant

Add `acceptance/repository-cloudant` package, modelled after MongoDB & MySQL
tests. The tests should be run as a new Travis CI job, see the existing setup
for other connectors.

#### Reject create/update requests when data contains navigational properties

Step 1:

- Introduce a new protected method `DefaultCrudRepository.fromEntity`.
- Update repository methods to call `fromEntity` whenever we need to convert LB4
  Entity into data to be passed to juggler's PersistedModel.
- This new method is an extension point for app & extension developers, it
  complements already existing `toEntity` method and provides functionality
  similar to LB3 Operation Hook `persist`.

Step 2:

- Modify `fromEntity` to detect navigational properties in data and throw a
  helpful error.

See
https://github.com/strongloop/loopback-next/commit/5beb7b93a3d1ce1077538bed39abfa31c309eba0

#### Verify relation type in `resolve{Relation}Metadata`

Improve helper functions `resolveHasManyMetadata`, `resolveBelongsToMetadata`,
`resolveHasOneMetadata` to assert that the provided metadata has the right
relation type.

This is important because in some places we are casting generic
`RelationMetadata` to a more specific variant, thus bypassing compiler checks.

#### Add `keyFrom` to resolved relation metadata

Add `keyFrom` to HasOne/HasMany resolved metadata. This enables a more generic
implementation of inclusion resolvers, because we can use `keyFrom` instead of
having to find out what is the name of the primary key (which I found difficult
to implement inside inclusion resolvers because of TypeScript limitations).

See https://github.com/strongloop/loopback-next/commit/a624d9701

#### Test relations against databases

Refactor existing integration & acceptance tests for relations, move most (or
all) of them to
[repository-tests](https://github.com/strongloop/loopback-next/tree/master/packages/repository-tests)
package.

Tests to review & move:

- [`belongs-to.relation.acceptance.ts`](https://github.com/strongloop/loopback-next/blob/master/packages/repository/src/__tests__/acceptance/belongs-to.relation.acceptance.ts)
- [`has-many-without-di.relation.acceptance.ts`](https://github.com/strongloop/loopback-next/blob/master/packages/repository/src/__tests__/acceptance/has-many-without-di.relation.acceptance.ts)
- [`has-many.relation.acceptance.ts`](https://github.com/strongloop/loopback-next/blob/master/packages/repository/src/__tests__/acceptance/has-many.relation.acceptance.ts)
- [`has-one.relation.acceptance.ts`](https://github.com/strongloop/loopback-next/blob/master/packages/repository/src/__tests__/acceptance/has-one.relation.acceptance.ts)
- [`relation.factory.integration.ts`](https://github.com/strongloop/loopback-next/blob/master/packages/repository/src/__tests__/integration/repositories/relation.factory.integration.ts) -
  this file needs to be split into multiple smaller files, one (or more) for
  each relation type.

I am not sure how much work will be required to make these tests pass against
MongoDB. If it would require non-trivial amount of time, then:

- Introduce a new `CrudFeature` flag allowing MongoDB test suite to skip these
  new tests.
- Open a follow-up issue to investigate & fix the MongoDB test suite later.

#### `findByForeignKeys` helper - initial version

Implement a new helper function `findByForeignKeys`, it will become a part of a
public API of `@loopback/repository`.

Signature:

```ts
function findByForeignKeys<
  Target extends Entity,
  TargetID,
  TargetRelations extends object,
  ForeignKey
>(
  targetRepository: EntityCrudRepository<Target, TargetID, TargetRelations>,
  fkName: StringKeyOf<Target>,
  fkValues: ForeignKey[],
  scope?: Filter<Target>,
  options?: Options,
): Promise<(Target & TargetRelations)[]>;
```

The initial version should be simple, "inq splitting" and additional "scope"
constraints are out of scope of this task.

It's important to create testing infrastructure that will make it easy to add
new tests in the future. There should be two kinds of tests:

- Unit-level tests inside `packages/repository`, these tests should mock
  `targetRepository`. By using a mock repository, we can assert on how many
  queries are called, introduce errors to verify how are they handled, etc.
- Integration-level tests inside `packages/repository-tests`, these tests will
  call real repository class & database, we will invoke them against different
  connectors (MySQL, MongoDB, and so on).

#### Support `inq` splitting in `findByForeignKeys`

The inclusion API does not impose any limit on how many entries can be passed in
`fkValues` parameter. Not all databases support arbitrary number of parameters
for `IN` (`inq`) condition though.

In this task, we need to improve `findByForeignKeys` to handle the maximum size
of `inq` parameter supported by the target database (data-source). When the list
of provided FK values is too long, then we should split it into smaller chunks
and execute multiple queries.

To allow the helper to detect `inqLimit`, we need to extend Repository
interfaces.

- Introduce `RepositoryCapabilities` interface (called `ConnectorCapabilities`
  in the spike), this interface will have a single property `inqLimit` (for
  now).
- Introduce `RepositoryWithCapabilities` interface (called `WithCapabilities` in
  the spike), this interface should define `capabilities` property.
- Implement `isRepositoryWithCapabilities` type guard
- Implement `getRepositoryCapabilities` helper

The rest should be straightforward:

- Modify `findByForeignKeys` to obtain `inqLimit` from repository capabilities
  and implement query splitting (see the spike implementation).
- Write unit-level tests where we verify what (and how many) queries are called
  by `findByForeignKeys`.
- Write integration-level tests (in `repository-tests`) to verify that
  connectors can handle `inqLimit` they are advertising. For example, create a
  test that runs a query returning 1000 records.

#### Introduce `InclusionResolver` concept

- Introduce a new interface `InclusionResolver`
- Implement a new helper function `includeRelatedModels`, it will become a part
  of a public API of `@loopback/repository`. Under the hood, this function
  should leverage inclusion resolvers to fetch related models.
- Write unit-level tests to verify the implementation, use mocked or stubbed
  inclusion resolvers.

Note: helper name `includeRelatedModels` is not final, feel free to propose a
better one!

#### Include related models in `DefaultCrudRepository`

- Enhance `DefaultCrudRepository` class: add a new public property
  `inclusionResolvers` and a new public method `registerInclusionResolver`
- Add a new protected method `includeRelatedModels`, this method will become an
  extension point for repository classes extending our default implementation.
- Modify `find`, `findById` and `findOne` methods to call `includeRelatedModels`
  and also to remove `filter.include` from the filter argument passed to
  juggler's `PersistedModel` APIs (see `normalizeFilter` in the spike).
- Under the hood, this new method should call the recently introduced helper
  `includeRelatedModels`.
- Write unit-level tests to verify the implementation, use mocked or stubbed
  inclusion resolvers.

#### Implement InclusionResolver for hasMany relation

- Implement a factory function for creating an inclusion resolver for the given
  hasMany relation (see `createHasManyInclusionResolver` in the spike).
- Enhance `HasManyRepositoryFactory` to provide `resolver` property (see the
  spike).
- Write integration-level tests in `packages/repository-tests` to verify that
  resolver works for real databases.
- Feel free to write unit-level tests using mocked repositories too, as needed.
- Update documentation (e.g.
  [Configuring a hasMany relation](https://loopback.io/doc/en/lb4/HasMany-relation.html#configuring-a-hasmany-relation)
  to explain how to enable or disable inclusion.

#### Implement InclusionResolver for belongsTo relation

- Implement a factory function for creating an inclusion resolver for the given
  hasMany relation (see `createHasManyInclusionResolver` in the spike).
- Enhance `HasManyRepositoryFactory` to provide `resolver` property (see the
  spike).
- Write integration-level tests in `packages/repository-tests` to verify that
  resolver works for real databases.
- Feel free to write unit-level tests using mocked repositories too, as needed.
- Update documentation (e.g.
  [Configuring a belongsTo relation](https://loopback.io/doc/en/lb4/BelongsTo-relation.html#configuring-a-belongsto-relation)
  to explain how to enable or disable inclusion.

#### Implement InclusionResolver for hasOne relation

- Implement a factory function for creating an inclusion resolver for the given
  hasMany relation (see `createHasManyInclusionResolver` in the spike).
- Enhance `HasManyRepositoryFactory` to provide `resolver` property (see the
  spike).
- Write integration-level tests in `packages/repository-tests` to verify that
  resolver works for real databases.
- Feel free to write unit-level tests using mocked repositories too, as needed.
- Update documentation (e.g.
  [Configuring a hasOne relation](https://loopback.io/doc/en/lb4/hasOne-relation.html#configuring-a-hasone-relation)
  to explain how to enable or disable inclusion.

#### Update `todo-list` example to use inclusion resolvers

Remove manually written "poor man's" resolvers, replace them with the real
resolvers.

#### Add inclusion resolvers to `lb4 relation` CLI

At the moment, `lb4 relation` initializes the factory for relation repository.
We need to enhance this part to register the inclusion resolver too.

#### Blog post

Write a blog post announcing the new features, describing the high-level design
and listing limitations of the initial implementation (e.g. as a list of GH
issues that are out of MVP scope).

### Post-MVP

- [Inclusion with custom scope](#inclusion-with-custom-scope)
- [Recursive inclusion](#recursive-inclusion)
- [Interaction between `filter.fields` and `filter.include`](#interaction-between-filterfields-and-filterinclude)
- [Syntax sugar for `filter.include`](#syntax-sugar-for-filterinclude)
- [MongoDB and `ObjectID` type](#mongodb-and-objectid-type)
