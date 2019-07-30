---
lang: en
title: 'Testing your application'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Testing-your-application.html
---

## Overview

A thorough automated test suite is important because it:

- Ensures your application works as expected.
- Prevents regressions when new features are added and bugs are fixed.
- Helps new and existing developers understand different parts of the codebase
  (knowledge sharing).
- Speeds up development over the long run (the code writes itself!).

### Types of tests

We encourage writing tests from a few perspectives, mainly
[black-box testing](https://en.wikipedia.org/wiki/Black-box_testing)
(acceptance) and
[white-box testing](https://en.wikipedia.org/wiki/White-box_testing)
(integration and unit). Tests are usually written using typical patterns such as
[`arrange/act/assert`](https://msdn.microsoft.com/en-us/library/hh694602.aspx#Anchor_3)
or [`given/when/then`](https://martinfowler.com/bliki/GivenWhenThen.html). Both
styles work well, so pick one that you're comfortable with and start writing
tests!

For an introduction to automated testing, see
[Define your testing strategy](Defining-your-testing-strategy.md).

{% include important.html content=" A great test suite requires you to think
smaller and favor fast and focused unit tests over slow end-to-end tests.
" %}

This article is a reference guide for common types of tests and test helpers.

## Project setup

An automated test suite requires a test runner to execute all the tests and
produce a summary report. We use and recommend [Mocha](https://mochajs.org).

In addition to a test runner, the test suites generally require:

- An assertion library (we recommend [Should.js](https://shouldjs.github.io)).
- A library for making HTTP calls and verifying their results (we recommend
  [supertest](https://github.com/visionmedia/supertest)).
- A library for creating test doubles (we recommend
  [Sinon.JS](http://sinonjs.org/)).

The [@loopback/testlab](https://www.npmjs.com/package/@loopback/testlab) module
integrates these packages and makes them easy to use together with LoopBack.

### Set up testing infrastructure with LoopBack CLI

LoopBack applications that have been generated using the `lb4 app` command from
`@loopback/cli` come with `@loopback/testlab` and `mocha` as a default, so no
other testing infrastructure setup is needed.

### Setup testing infrastructure manually

If you have an existing application install `mocha` and `@loopback/testlab`:

```shell
npm install --save-dev mocha @loopback/testlab
```

Your `package.json` should then look something like this:

```js
{
  // ...
  "devDependencies": {
    "@loopback/testlab": "^<current-version>",
    "@types/mocha": "^<current-version>",
    "mocha": "^<current-version>"
  },
  "scripts": {
    "test": "mocha --recursive \"dist/test\""
  }
  // ...
}
```

## Data handling

Tests accessing a real database often require existing data. For example, a
method listing all products needs some products in the database; a method to
create a new product instance must determine which properties are required and
any restrictions on their values. There are various approaches to address this
issue. Many of them unfortunately make the test suite difficult to understand,
difficult to maintain, and prone to test failures unrelated to the changes made.

Our approach to data handling, based on our experience, is described in this
section.

### Create a test datasource

As we would prefer full control of the database and even the development
database is not something we want to clean before each test it's handy to use an
independent in-memory datasource which is filled appropriately using
[test data builders](#use-test-data-builders) before each test run.

{% include code-caption.html content="src/__tests__/fixtures/datasources/testdb.datasource.ts" %}

```ts
import {juggler} from '@loopback/repository';

export const testdb: juggler.DataSource = new juggler.DataSource({
  name: 'db',
  connector: 'memory',
});
```

### Clean the database before each test

Start with a clean database before each test. This may seem counter-intuitive:
why not reset the database after the test has finished? When a test fails and
the database is cleaned after the test has finished, then it's difficult to
observe what was stored in the database and why the test failed. When the
database is cleaned in the beginning, then any failing test will leave the
database in the state that caused the test to fail.

To clean the database before each test, set up a `beforeEach` hook to call a
helper method; for example:

{% include code-caption.html content="src/__tests__/helpers/database.helpers.ts" %}

```ts
import {ProductRepository, CategoryRepository} from '../../src/repositories';
import {testdb} from '../fixtures/datasources/testdb.datasource';

export async function givenEmptyDatabase() {
  await new ProductRepository(testdb).deleteAll();
  await new CategoryRepository(testdb).deleteAll();
}
```

In case a repository includes a relation to another repository, ie. Product
belongs to Category, include it in the repository call, for example:

{% include code-caption.html content="src/__tests__/helpers/database.helpers.ts" %}

```ts
import {Getter} from '@loopback/context';
import {ProductRepository, CategoryRepository} from '../../src/repositories';
import {testdb} from '../fixtures/datasources/testdb.datasource';

export async function givenEmptyDatabase() {
  let categoryRepository: CategoryRepository;
  let productRepository: ProductRepository;

  categoryRepository = new CategoryRepository(
    testdb,
    async () => productRepository,
  );

  productRepository = new ProductRepository(
    testdb,
    async () => categoryRepository,
  );

  await productRepository.deleteAll();
  await categoryRepository.deleteAll();
}
```

{% include code-caption.html content="src/__tests__/integration/controllers/product.controller.integration.ts" %}

```ts
// in your test file
import {givenEmptyDatabase} from '../../helpers/database.helpers';

describe('ProductController (integration)', () => {
  before(givenEmptyDatabase);
  // etc.
});
```

### Use test data builders

To avoid duplicating code for creating model data that is complete with required
properties, use shared
[test data builders](http://www.natpryce.com/articles/000714.html). This enables
tests to provide the small subset of properties that is strictly required by the
tested scenario. Using shared test builders will help your tests to be:

- Easier to understand, since it's immediately clear what model properties are
  relevant to the tests. If the tests set the required properties, it is
  difficult to tell whether the properties are actually relevant to the tested
  scenario.

- Easier to maintain. As your data model evolves, you will need to add more
  required properties. If the tests build the model instance data manually, all
  the tests must be manually updated to set a new required property. With a
  shared test data builder, you update a single location with the new property.

See
[@loopback/openapi-spec-builder](https://www.npmjs.com/package/@loopback/openapi-spec-builder)
for an example of how to apply this design pattern for building OpenAPI Spec
documents.

In practice, a simple function that adds missing required properties is
sufficient.

{% include code-caption.html content="src/__tests__/helpers/database.helpers.ts" %}

```ts
// ...
export function givenProductData(data?: Partial<Product>) {
  return Object.assign(
    {
      name: 'a-product-name',
      slug: 'a-product-slug',
      price: 1,
      description: 'a-product-description',
      available: true,
    },
    data,
  );
}

export async function givenProduct(data?: Partial<Product>) {
  return new ProductRepository(testdb).create(givenProductData(data));
}
// ...
```

### Avoid sharing the same data for multiple tests

It's tempting to define a small set of data to be shared by all tests. For
example, in an e-commerce application, you might pre-populate the database with
a few categories, some products, an admin user and a customer. This approach has
several downsides:

- When trying to understand any individual test, it's difficult to tell what
  part of the pre-populated data is essential for the test and what's
  irrelevant. For example, in a test checking the method counting the number of
  products in a category using a pre-populated category "Stationery", is it
  important that "Stationery" contains nested sub-categories or is that fact
  irrelevant? If it's irrelevant, then what are the other tests that depend on
  it?

- As the application grows and new features are added, it's easier to add more
  properties to existing model instances rather than create new instances using
  only the properties required by the new features. For example, when adding a
  category image, it's easier to add image to an existing category "Stationery"
  and perhaps keep another category "Groceries" without any image, rather than
  creating two new categories "CategoryWithAnImage" and "CategoryMissingImage".
  This further amplifies the previous problem, because it's not clear that
  "Groceries" is the category that should be used by tests requiring a category
  with no image - the category name does not provide any hints on that.

- As the shared dataset grows (together with the application), the time required
  to bring the database into its initial state grows too. Instead of running a
  few "DELETE ALL" queries before each test (which is relatively fast), you may
  have to run tens or hundreds of different commands used to create different
  model instances, thus triggering slow index rebuilds along the way and slowing
  down the test suite considerably.

Use the test data builders described in the previous section to populate your
database with the data specific to your test only.

<!-- NOTE: the code below deals with relations which have not been implemented
in LoopBack4 yet and has been commented out. It needs to be revisited once it's
been implemented. -->

<!-- Using the e-commerce example described above, this is how integration tests
for the `CategoryRepository` might look:

```ts
describe('Category (integration)', () => {
  beforeEach(givenEmptyDatabase);

  describe('countProducts()', () => {
    it('returns correct count for an empty', async () => {
      const category = await givenCategory();
      const count = await category.countProducts();
      expect(count).to.equal(0);
    });

    // etc.

    it('includes products in subcategories', async () => {
      const category = await givenCategory({
        products: [await givenProduct()],
        subcategories: [
          await givenCategory({
            products: [await givenProduct()]
          })
        ],
      });

      const count = await category.countProducts();
      expect(count).to.equal(2);
    });
  });
});
``` -->

Write higher-level helpers to share the code for re-creating common scenarios.
For example, if your application has two kinds of users (admins and customers),
then you may write the following helpers to simplify writing acceptance tests
checking access control:

```ts
async function givenAdminAndCustomer() {
  return {
    admin: await givenUser({role: Roles.ADMIN}),
    customer: await givenUser({role: Roles.CUSTOMER}),
  };
}
```

## Unit testing

Unit tests are considered "white-box" tests because they use an "inside-out"
approach where the tests know about the internals and control all the variables
of the system being tested. Individual units are tested in isolation and their
dependencies are replaced with
[Test doubles](https://en.wikipedia.org/wiki/Test_double).

### Use test doubles

Test doubles are functions or objects that look and behave like the real
variants used in production, but are actually simplified versions that give the
test more control of the behavior. For example, reproducing the situation where
reading from a file failed because of a hard-drive error is pretty much
impossible. However, using a test double to simulate the file-system API will
provide control over what each call returns.

[Sinon.JS](http://sinonjs.org/) has become the de-facto standard for test
doubles in Node.js and JavaScript/TypeScript in general. The `@loopback/testlab`
package comes with Sinon preconfigured with TypeScript type definitions and
integrated with Should.js assertions.

There are three kinds of test doubles provided by Sinon.JS:

- [Test spies](http://sinonjs.org/releases/v4.0.1/spies/) are functions that
  record arguments, the return value, the value of `this`, and exceptions thrown
  (if any) for all its calls. There are two types of spies: Some are anonymous
  functions, while others wrap methods that already exist in the system under
  test.

- [Test stubs](http://sinonjs.org/releases/v4.0.1/stubs/) are functions (spies)
  with pre-programmed behavior. As spies, stubs can be either anonymous, or wrap
  existing functions. When wrapping an existing function with a stub, the
  original function is not called.

- [Test mocks](http://sinonjs.org/releases/v4.0.1/mocks/) (and mock
  expectations) are fake methods (like spies) with pre-programmed behavior (like
  stubs) as well as pre-programmed expectations. A mock will fail your test if
  it is not used as expected.

{% include note.html content="
We recommend against using test mocks. With test
mocks, the expectations must be defined before the tested scenario is executed,
which breaks the recommended test layout 'arrange-act-assert' (or
'given-when-then') and also produces code that's difficult to comprehend.
" %}

#### Create a stub Repository

When writing an application that accesses data in a database, the best practice
is to use [repositories](Repositories.md) to encapsulate all
data-access/persistence-related code. Other parts of the application (typically
[controllers](Controllers.md)) can then depend on these repositories for data
access. To test Repository dependents (for example, Controllers) in isolation,
we need to provide a test double, usually as a test stub.

In traditional object-oriented languages like Java or C#, to enable unit tests
to provide a custom implementation of the repository API, the controller needs
to depend on an interface describing the API, and the repository implementation
needs to implement this interface. The situation is easier in JavaScript and
TypeScript. Thanks to the dynamic nature of the language, it’s possible to
mock/stub entire classes.

Creating a test double for a repository class is very easy using the Sinon.JS
utility function `createStubInstance`. It's important to create a new stub
instance for each unit test in order to prevent unintended re-use of
pre-programmed behavior between (unrelated) tests.

```ts
describe('ProductController', () => {
  let repository: ProductRepository;
  beforeEach(givenStubbedRepository);

  // your unit tests

  function givenStubbedRepository() {
    repository = sinon.createStubInstance(ProductRepository);
  }
});
```

In your unit tests, you will usually want to program the behavior of stubbed
methods (what they should return) and then verify that the Controller (unit
under test) called the right method with the correct arguments.

Configure stub's behavior at the beginning of your unit test (in the "arrange"
or "given" section):

```ts
// repository.find() will return a promise that
// will be resolved with the provided array
const findStub = repository.find as sinon.SinonStub;
findStub.resolves([{id: 1, name: 'Pen'}]);
```

Verify how was the stubbed method executed at the end of your unit test (in the
"assert" or "then" section):

```ts
// expect that repository.find() was called with the first
// argument deeply-equal to the provided object
sinon.assert.calledWithMatch(findStub, {where: {id: 1}});
```

See [Unit test your controllers](#unit-test-your-controllers) for a full
example.

#### Create a stub Service

If your controller relies on service proxy for service oriented backends such as
REST APIs, SOAP Web Services, or gRPC microservices, then we can create stubs
for the service akin to the steps outlined in the above
[stub repository](#create-a-stub-repository) section. Consider a dependency on a
`GeoCoder` service that relies on a remote REST API for returning coordinates
for a specific address.

```ts
export interface GeocoderService {
  geocode(address: string): Promise<GeoPoint[]>;
}
```

The first step is to create a mocked instance of the `GeocoderService` API and
configure its `geocode` method as a Sinon stub:

```ts
describe('GeocoderController', () => {
  let geoService: GeoCoderService;
  let geocode: sinon.SinonStub;

  beforeEach(givenMockGeoCoderService);

  // your unit tests

  function givenMockGeoCoderService() {
    // this creates a stub with GeocoderService API
    // in a way that allows the compiler to verify type correctness
    geoService = {geocode: sinon.stub()};

    // this creates a reference to the stubbed "geocode" method
    // because "geoService.geocode" has type from GeocoderService
    // and does not provide Sinon APIs
    geocode = geoService.geocode as sinon.SinonStub;
  }
});
```

Afterwards, we can configure the `geocode` stub's behaviour before the `act`
phase of our test(s):

```ts
// geoService.geocode() will return a promise that
// will be resolved with the provided array
geocode.resolves([<GeoPoint>{y: 41.109653, x: -73.72467}]);
```

Lastly, we'll verify how the stub was executed:

```ts
// expect that geoService.geocode() was called with the first
// argument equal to the provided address string
sinon.assert.calledWithMatch(geocode, '1 New Orchard Road, Armonk, 10504');
```

Check out
[TodoController unit tests](https://github.com/strongloop/loopback-next/blob/bd0c45033503f631a533ad6176620354d9cf6768/examples/todo/src/__tests__/unit/controllers/todo.controller.unit.ts#L53-L71)
illustrating the above points in action for more information.

### Unit test your Controllers

Unit tests should apply to the smallest piece of code possible to ensure that
other variables and state changes do not pollute the result. A typical unit test
creates a controller instance with dependencies replaced by test doubles and
directly calls the tested method. The example below gives the controller a stub
implementation of its repository dependency using the `testlab`
`createStubInstance` function, ensures the controller calls the repository's
`find()` method with a correct query, and returns back the query results. See
[Create a stub repository](#create-a-stub-repository) for a detailed
explanation.

{% include code-caption.html content="src/__tests__/unit/controllers/product.controller.unit.ts" %}

```ts
import {
  createStubInstance,
  expect,
  sinon,
  StubbedInstanceWithSinonAccessor,
} from '@loopback/testlab';
import {ProductRepository} from '../../../src/repositories';
import {ProductController} from '../../../src/controllers';

describe('ProductController (unit)', () => {
  let repository: StubbedInstanceWithSinonAccessor<ProductRepository>;
  beforeEach(givenStubbedRepository);

  describe('getDetails()', () => {
    it('retrieves details of a product', async () => {
      const controller = new ProductController(repository);
      repository.stubs.find.resolves([{name: 'Pen', slug: 'pen'}]);

      const details = await controller.getDetails('pen');

      expect(details).to.containEql({name: 'Pen', slug: 'pen'});
      sinon.assert.calledWithMatch(repository.stubs.find, {
        where: {slug: 'pen'},
      });
    });
  });

  function givenStubbedRepository() {
    repository = createStubInstance(ProductRepository);
  }
});
```

### Unit test your models and repositories

In a typical LoopBack application, models and repositories rely on behavior
provided by the framework (`@loopback/repository` package) and there is no need
to test LoopBack's built-in functionality. However, any additional
application-specific APIs do need new unit tests.

For example, if the `Person` Model has properties `firstname`, `middlename` and
`surname` and provides a function to obtain the full name, then you should write
unit tests to verify the implementation of this additional method.

Remember to use [Test data builders](#use-test-data-builders) whenever you need
valid data to create a new model instance.

{% include code-caption.html content="src/__tests__/unit/models/person.model.unit.ts" %}

```ts
import {Person} from '../../../src/models';
import {givenPersonData} from '../../helpers/database.helpers';
import {expect} from '@loopback/testlab';

describe('Person (unit)', () => {
  // we recommend to group tests by method names
  describe('getFullName()', () => {
    it('uses all three parts when present', () => {
      const person = givenPerson({
        firstname: 'Jane',
        middlename: 'Smith',
        surname: 'Brown',
      });

      const fullName = person.getFullName();
      expect(fullName).to.equal('Jane Smith Brown');
    });

    it('omits middlename when not present', () => {
      const person = givenPerson({
        firstname: 'Mark',
        surname: 'Twain',
      });

      const fullName = person.getFullName();
      expect(fullName).to.equal('Mark Twain');
    });
  });

  function givenPerson(data: Partial<Person>) {
    return new Person(givenPersonData(data));
  }
});
```

Writing a unit test for custom repository methods is not as straightforward
because `CrudRepository` is based on legacy
[loopback-datasource-juggler](https://github.com/strongloop/loopback-datasource-juggler)
which was not designed with dependency injection in mind. Instead, use
integration tests to verify the implementation of custom repository methods. For
more information, refer to
[Test your repositories against a real database](#test-your-repositories-against-a-real-database)
in [Integration Testing](#integration-testing).

### Unit test your Sequence

While it's possible to test a custom Sequence class in isolation, it's better to
rely on acceptance-level tests in this exceptional case. The reason is that a
custom Sequence class typically has many dependencies (which can make test setup
long and complex), and at the same time it provides very little functionality on
top of the injected sequence actions. Bugs are much more likely to be caused by
the way the real sequence action implementations interact together (which is not
covered by unit tests), instead of the Sequence code itself (which is the only
thing covered).

See [Test Sequence customizations](#test-sequence-customizations) in
[Acceptance Testing](#acceptance-end-to-end-testing).

## Integration testing

Integration tests are considered "white-box" tests because they use an
"inside-out" approach that tests how multiple units work together or with
external services. You can use test doubles to isolate tested units from
external variables/state that are not part of the tested scenario.

### Test your repositories against a real database

There are two common reasons for adding repository tests:

- Your models are using an advanced configuration, for example, custom column
  mappings, and you want to verify this configuration is correctly picked up by
  the framework.
- Your repositories have additional methods.

Integration tests are one of the places to put the best practices in
[Data handling](#data-handling) to work:

- Clean the database before each test
- Use test data builders
- Avoid sharing the same data for multiple tests

Here is an example showing how to write an integration test for a custom
repository method `findByName`:

{% include code-caption.html content="src/__tests__/integration/repositories/category.repository.integration.ts" %}

```ts
import {
  givenEmptyDatabase,
  givenCategory,
} from '../../helpers/database.helpers';
import {CategoryRepository} from '../../../src/repositories';
import {expect} from '@loopback/testlab';
import {testdb} from '../../fixtures/datasources/testdb.datasource';

describe('CategoryRepository (integration)', () => {
  beforeEach(givenEmptyDatabase);

  describe('findByName(name)', () => {
    it('return the correct category', async () => {
      const stationery = await givenCategory({name: 'Stationery'});
      const repository = new CategoryRepository(testdb);

      const found = await repository.findByName('Stationery');

      expect(found).to.deepEqual(stationery);
    });
  });
});
```

### Test controllers and repositories together

Integration tests running controllers with real repositories are important to
verify that the controllers use the repository API correctly, and that the
commands and queries produce expected results when executed on a real database.
These tests are similar to repository tests with controllers added as another
ingredient.

{% include code-caption.html content="src/__tests__/integration/controllers/product.controller.integration.ts" %}

```ts
import {expect} from '@loopback/testlab';
import {givenEmptyDatabase, givenProduct} from '../../helpers/database.helpers';
import {ProductController} from '../../../src/controllers';
import {ProductRepository} from '../../../src/repositories';
import {testdb} from '../../fixtures/datasources/testdb.datasource';

describe('ProductController (integration)', () => {
  beforeEach(givenEmptyDatabase);

  describe('getDetails()', () => {
    it('retrieves details of the given product', async () => {
      const pencil = await givenProduct({name: 'Pencil', slug: 'pencil'});
      const controller = new ProductController(new ProductRepository(testdb));

      const details = await controller.getDetails('pencil');

      expect(details).to.containEql(pencil);
    });
  });
});
```

### Test your Services against real backends

When integrating with other services (including our own microservices), it's
important to verify that our client configuration is correct and the client
(service proxy) API is matching the actual service implementation. Ideally,
there should be at least one integration test for each endpoint (operation)
consumed by the application.

To write an integration test, we need to:

- Obtain an instance of the tested service proxy. Optionally modify the
  connection configuration, for example change the target URL or configure a
  caching proxy to speed up tests.
- Execute service proxy methods and verify that expected results were returned
  by the backend service.

#### Obtain a Service Proxy instance

In
[Make service proxies easier to test](./Calling-other-APIs-and-Web-Services.md#make-service-proxies-easier-to-test),
we are suggesting to leverage Providers as a tool allowing both the IoC
framework and the tests to access service proxy instances.

In the integration tests, a test helper should be written to obtain an instance
of the service proxy by invoking the provider. This helper should be typically
invoked once before the integration test suite begins.

```ts
import {
  GeoService,
  GeoServiceProvider,
} from '../../src/services/geo.service.ts';
import {GeoDataSource} from '../../src/datasources/geo.datasource.ts';

describe('GeoService', () => {
  let service: GeoService;
  before(givenGeoService);

  // to be done: add tests here

  function givenGeoService() {
    const dataSource = new GeoDataSource();
    service = new GeoServiceProvider(dataSource).value();
  }
});
```

If needed, you can tweak the datasource config before creating the service
instance:

```ts
import {merge} from 'lodash';
import * as GEO_CODER_CONFIG from '../src/datasources/geo.datasource.json';

function givenGeoService() {
  const config = merge({}, GEO_CODER_CONFIG, {
    // your config overrides
  });
  const dataSource = new GeoDataSource(config);
  service = new GeoServiceProvider(dataSource).value();
}
```

#### Test invidivudal service methods

With the service proxy instance available, integration tests can focus on
executing individual methods with the right set of input parameters; and
verifying the outcome of those calls.

```ts
it('resolves an address to a geo point', async () => {
  const points = await service.geocode('1 New Orchard Road, Armonk, 10504');

  expect(points).to.deepEqual([
    {
      lat: 41.109653,
      lng: -73.72467,
    },
  ]);
});
```

## Acceptance (end-to-end) testing

Automated acceptance (end-to-end) tests are considered "black-box" tests because
they use an "outside-in" approach that is not concerned about the internals of
the system. Acceptance tests perform the same actions (send the same HTTP
requests) as the clients and consumers of your API will do, and verify that the
results returned by the system match the expected results.

Typically, acceptance tests start the application, make HTTP requests to the
server, and verify the returned response. LoopBack uses
[supertest](https://github.com/visionmedia/supertest) to create test code that
simplifies both the execution of HTTP requests and the verification of
responses. Remember to follow the best practices from
[Data handling](#data-handling) when setting up your database for tests:

- Clean the database before each test
- Use test data builders
- Avoid sharing the same data for multiple tests

### Validate your OpenAPI specification

The OpenAPI specification is a cornerstone of applications that provide REST
APIs. It enables API consumers to leverage a whole ecosystem of related tooling.
To make the spec useful, you must ensure it's a valid OpenAPI Spec document,
ideally in an automated way that's an integral part of regular CI builds.
LoopBack's [testlab](https://www.npmjs.com/package/@loopback/testlab) module
provides a helper method `validateApiSpec` that builds on top of the popular
[swagger-parser](https://www.npmjs.com/package/swagger-parser) package.

Example usage:

{% include code-caption.html content= "src/__tests__/acceptance/api-spec.acceptance.ts" %}

```ts
import {HelloWorldApplication} from '../..';
import {RestServer} from '@loopback/rest';
import {validateApiSpec} from '@loopback/testlab';

describe('API specification', () => {
  it('api spec is valid', async () => {
    const app = new HelloWorldApplication();
    const server = await app.getServer(RestServer);
    const spec = server.getApiSpec();
    await validateApiSpec(spec);
  });
});
```

### Perform an auto-generated smoke test of your REST API

{% include important.html content=" The top-down approach for building LoopBack
applications is not yet fully supported. Therefore, the code outlined in this
section is outdated and may not work out of the box. Check out
https://github.com/strongloop/loopback-next/issues/1882 for the epic tracking
the feature and [OpenAPI generator](OpenAPI-generator.md) page for artifact
generation from OpenAPI specs.
" %}

The formal validity of your application's spec does not guarantee that your
implementation is actually matching the specified behavior. To keep your spec in
sync with your implementation, you should use an automated tool like
[Dredd](https://www.npmjs.com/package/dredd) to run a set of smoke tests to
verify your app conforms to the spec.

Automated testing tools usually require hints in your specification to tell them
how to create valid requests or what response data to expect. Dredd in
particular relies on response
[examples](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#exampleObject)
and request parameter
[x-example](http://dredd.org/en/latest/how-to-guides.html#example-values-for-request-parameters)
fields. Extending your API spec with examples is a good thing on its own, since
developers consuming your API will find them useful too.

Here is an example showing how to run Dredd to test your API against the spec:

{% include code-caption.html content= "src/__tests__/acceptance/api-spec.acceptance.ts" %}

```ts
import {expect} from '@loopback/testlab';
import {HelloWorldApplication} from '../..';
import {RestServer, RestBindings} from '@loopback/rest';
import {spec} from '../../apidefs/openapi';
const Dredd = require('dredd');

describe('API (acceptance)', () => {
  let app: HelloWorldApplication;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  let dredd: any;
  before(initEnvironment);
  after(async () => {
    await app.stop();
  });

  it('conforms to the specification', done => {
    dredd.run((err: Error, stats: object) => {
      if (err) return done(err);
      expect(stats).to.containDeep({
        failures: 0,
        errors: 0,
        skipped: 0,
      });
      done();
    });
  });

  async function initEnvironment() {
    app = new HelloWorldApplication();
    const server = await app.getServer(RestServer);
    // For testing, we'll let the OS pick an available port by setting
    // RestBindings.PORT to 0.
    server.bind(RestBindings.PORT).to(0);
    // app.start() starts up the HTTP server and binds the acquired port
    // number to RestBindings.PORT.
    await app.boot();
    await app.start();
    // Get the real port number.
    const port = await server.get(RestBindings.PORT);
    const baseUrl = `http://localhost:${port}`;
    const config: object = {
      server: baseUrl, // base path to the end points
      options: {
        level: 'fail', // report 'fail' case only
        silent: false, // false for helpful debugging info
        path: [`${baseUrl}/openapi.json`], // to download apiSpec from the service
      },
    };
    dredd = new Dredd(config);
  }
});
```

The user experience needs improvement and we are looking into better solutions.
See [GitHub issue #644](https://github.com/strongloop/loopback-next/issues/644).
Let us know if you have any recommendations!

### Test your individual REST API endpoints

You should have at least one acceptance (end-to-end) test for each of your REST
API endpoints. Consider adding more tests if your endpoint depends on (custom)
sequence actions to modify the behavior when the corresponding controller method
is invoked via REST, compared to behavior observed when the controller method is
invoked directly via JavaScript/TypeScript API. For example, if your endpoint
returns different responses to regular users and to admin users, then you should
two tests (one test for each user role).

Here is an example of an acceptance test:

{% include code-caption.html content= "src/__tests__/acceptance/product.acceptance.ts" %}

```ts
import {HelloWorldApplication} from '../..';
import {Client, createRestAppClient, expect} from '@loopback/testlab';
import {givenEmptyDatabase, givenProduct} from '../helpers/database.helpers';
import {RestServer, RestBindings} from '@loopback/rest';
import {testdb} from '../fixtures/datasources/testdb.datasource';

describe('Product (acceptance)', () => {
  let app: HelloWorldApplication;
  let client: Client;

  before(givenEmptyDatabase);
  before(givenRunningApp);
  after(async () => {
    await app.stop();
  });

  it('retrieves product details', async () => {
    // arrange
    const product = await givenProduct({
      name: 'Ink Pen',
      slug: 'ink-pen',
      price: 1,
      category: 'Stationery',
      description: 'The ultimate ink-powered pen for daily writing',
      label: 'popular',
      available: true,
      endDate: null,
    });
    const expected = Object.assign({id: product.id}, product);

    // act
    const response = await client.get('/product/ink-pen');

    // assert
    expect(response.body).to.containEql(expected);
  });

  async function givenRunningApp() {
    app = new HelloWorldApplication({
      rest: {
        port: 0,
      },
    });
    app.dataSource(testdb);
    await app.boot();
    await app.start();

    client = createRestAppClient(app);
  }
});
```

### Test Sequence customizations

Custom sequence behavior is best tested by observing changes in behavior of the
affected endpoints. For example, if your sequence has an authentication step
that rejects anonymous requests for certain endpoints, then you can write a test
making an anonymous request to those endpoints to verify that it's correctly
rejected. These tests are essentially the same as the tests verifying
implementation of individual endpoints as described in the previous section.
