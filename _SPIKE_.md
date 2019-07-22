# Spike: Resolve included models

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

### Limit on `inq` size

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

### MongoDB and `ObjectID` type

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

To be done after the high-level proposal is approved.
