- [DONE] how to test inclusion against all connectors

  - Move `@loopback/repository` integration + acceptance tests into a new
    package, e.g. `@loopback/repository-testsuite`
  - Basically, every test using `memory` datasource should be refactored into a
    test that can be executed against any other connector too.
  - Setup Travis CI jobs to execute those tests for a (sub)set of connectors as
    part of loopback-next CI
    - run example-todo & example-todo-list against other connectors too
  - Execute the new test suite from each connector: add
    `@loopback/repository-testsuite` into dev-dependencies and `npm test`
  - Q! How to land changes requiring changes in both the test suite and (all)
    connectors?

  - How to structure the test suite: when adding a new relation, we should be
    adding a new test file (possibly starting by copying the test file for an
    existing relation)

Edge cases to consider:

- query model with relations, then save the instance returned by the query:
  should repository methods remove navigational properties before saving?
  https://github.com/strongloop/loopback-datasource-juggler/blob/f0a6bd146b7ef2f987fd974ffdb5906cf6a584db/test/include.test.js#L104-L141

- include nested models (recursive inclusion)
  https://github.com/strongloop/loopback-datasource-juggler/blob/f0a6bd146b7ef2f987fd974ffdb5906cf6a584db/test/include.test.js#L175-L195

  User hasMany Post hasMany Comment

  - `userRepo.find({include: {posts: 'comments'}})`
  - `userRepo.find({include: {posts: {relation: 'comments'}}})`

  OUT OF SCOPE OF THE INITIAL VERSION, this is not even supported by our TS
  iface.

- inclusion with custom scope -- OUT OF SCOPE OF INITIAL IMPL
  https://github.com/strongloop/loopback-datasource-juggler/blob/f0a6bd146b7ef2f987fd974ffdb5906cf6a584db/test/include.test.js#L247-L253

  - custom "order", "limit", "skip" and "fields"
  - additional "scope.where" constraint

  OUT OF SCOPE OF THE INITIAL VERSION. We should throw an error when a custom
  scope is present.

- dataSource.settings.inqLimit

- interaction between "include" and "fields" (when the primary or foreign key is
  missing in fields, related models are not fetched)

- different syntax flavours

  - userRepo.find({include: ['posts', 'passports']})
  - userRepo.find({include: [ {relation: 'posts', scope: {where: {title: 'Post
    A'}}}, 'passports', ]}

  OUT OF SCOPE OF THIS SPIKE See
  https://github.com/strongloop/loopback-next/issues/3205

- how to prevent certain relations to be traversed (e.g. User -> AccessToken)

  Solved: don't register resolver for those relations in the repository class.

- test how many DB calls are made by the resolvers
  - including belongsTo should make only ' + nDBCalls + ' db calls'
    https://github.com/strongloop/loopback-datasource-juggler/blob/f0a6bd146b7ef2f987fd974ffdb5906cf6a584db/test/include.test.js#L1317
  - including hasManyThrough should make only 3 db calls'
    https://github.com/strongloop/loopback-datasource-juggler/blob/f0a6bd146b7ef2f987fd974ffdb5906cf6a584db/test/include.test.js#L1340
  - including hasMany should make only ' + dbCalls + ' db calls'
    https://github.com/strongloop/loopback-datasource-juggler/blob/f0a6bd146b7ef2f987fd974ffdb5906cf6a584db/test/include.test.js#L1395
  - should not make n+1 db calls in relation syntax'
    https://github.com/strongloop/loopback-datasource-juggler/blob/f0a6bd146b7ef2f987fd974ffdb5906cf6a584db/test/include.test.js#L1431

Additional things not covered by the initial implementation

- HasAndBelongsToMany - search juggler's test/include.test.js
- Inclusion for polymorphic relations, see jugglers' test/relations.test.js
- hasOne with scope (??), see jugglers' test/relations.test.js


---

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
user-supplied type with connector's default type when the PK is generated
by the database. See
[`DataSource.prototype.setupDataAccess()`](https://github.com/strongloop/loopback-datasource-juggler/blob/0c2bb81dace3592ecde8b9eccbd70d589da44d7d/lib/datasource.js#L713-L719)

Can we rework MongoDB connector to hide ObjectID complexity as an internal
implementation detail and always use string values in public APIs? Accept
ids as strings and internally convert them to ObjectID. Convert values returned
by the database from ObjectID to strings.

Downside: this is not going to work for free-form properties that don't have
any type definition and where the connector does not know that they should
be converted from string to ObjectID. But then keep in mind that JSON cannot
carry type information, therefore REST API clients are not able to set
free-form properties to ObjectID values even today.
