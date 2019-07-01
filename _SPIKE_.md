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
