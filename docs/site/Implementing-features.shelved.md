---
lang: en
title: 'Implementing features'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Implementing-features.html
---

{% include previous.html content=" This article continues from \[Defining your
testing stategy(./Defining-your-testing-strategy.md).
" %}

## Incrementally implement features

To recapitulate the status of your new project:

- You have defined your application's API and described it in an OpenAPI Spec
  document.
- You have empty controllers backing your new operations.
- Our project has a test verifying the validity of your API spec. This test
  passes.
- Our test suite includes a smoke test to verify conformance of your
  implementation with the API spec. These checks are all failing now.

Now it's time to put your testing strategy outlined in the previous section into
practice. Pick one of the new API operations, preferably the one that's easiest
to implement, and get to work!

Start with `GET /product/{slug}` in this guide.

### Write an acceptance test

One "acceptance test", where you start the application, make an HTTP request to
search for a given product name, and verify that expected products were
returned. This verifies that all parts of your application are correctly wired
together.

Create `src/__tests__/acceptance/product.acceptance.ts` with the following
contents:

```ts
import {HelloWorldApp} from '../..';
import {RestBindings, RestServer} from '@loopback/rest';
import {Client, expect, supertest} from '@loopback/testlab';

describe('Product (acceptance)', () => {
  let app: HelloWorldApp;
  let request: Client;

  before(givenEmptyDatabase);
  before(givenRunningApp);

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

    // act
    const response = await request.get('/product/ink-pen');

    // assert
    expect(response.body).to.deepEqual({
      id: product.id,
      name: 'Ink Pen',
      slug: 'ink-pen',
      price: 1,
      category: 'Stationery',
      available: true,
      description: 'The ultimate ink-powered pen for daily writing',
      label: 'popular',
      endDate: null,
    });
  });

  async function givenEmptyDatabase() {
    // TODO
  }

  async function givenRunningApp() {
    app = new HelloWorldApp({
      rest: {
        port: 0,
      },
    });
    await app.start();
    request = supertest(app.restServer.url);
  }

  async function givenProduct(data: Object) {
    // TODO
    return Object.assign({}, data, {id: 1});
  }
});
```

Notice there are few missing pieces annotated with TODO comments. Well come back
to them very soon. Remember, when practicing TDD in small steps, the goal is to
add as little test code as needed to uncover a missing piece in the production
code, and then add just enough production code to make your new test pass (while
keeping all existing tests passing too).

Run the tests and watch the new test fail:

```text
  1) Product (acceptance) retrieves product details:
     Error: expected 200 "OK", got 404 "Not Found"
```

When you scroll up in the test output, you will see more information about the
404 error:

```text
Unhandled error in GET /product/ink-pen: 404 Error: Controller method not found: ProductController.getDetails
```

Learn more about acceptance testing in
[Test your individual REST API endpoints](./Testing-your-application.md#test-your-individual-rest-api-endpoints)
from [Testing your application](./Testing-your-application.md).

### Write a unit-test for the new controller method

The new acceptance test is failing because there is no `getDetails` method
implemented by `ProductController`. Start with a unit-test to drive the
implementation of this new method. Please refer to
[Unit-test your Controllers](./Testing-your-application.md#unit-test-your-controllers)
for more details.

Create `tests/unit/product-controller.test.ts` with the following contents:

```ts
import {ProductController} from '../..';
import {expect} from '@loopback/testlab';

describe('ProductController', () => {
  describe('getDetails()', () => {
    it('retrieves details of a given product', async () => {
      const controller = new ProductController();
      const details = controller.getDetails('ink-pen');
      expect(details).to.containDeep({
        name: 'Ink Pen',
        slug: 'ink-pen',
      });
    });
  });
});
```

This test is clearly not describing a final solution, for example there is no
Product model and repository involved. However, it's a good first increment that
drives enough of the initial controller implementation. This shows the power of
unit testing - you can test this new controller method in isolation, independent
from the other moving parts of the application, even before those other parts
are implemented!

Run `npm test` and watch the test fail with a helpful error message:

```text
TSError: ⨯ Unable to compile TypeScript
src/__tests__/unit/product-controller.test.ts (13,40): Property 'getDetails' does not exist on type 'ProductController'. (2339)
```

Now it's time to write the first implementation of the `getDetails` method.
Modify the file `src/controllers/product-controller.ts` as follows:

```ts
export class ProductController {
  async getDetails(slug: string) {
    return {
      name: 'Ink Pen',
      slug: 'ink-pen',
    };
  }
}
```

Run `npm test` to see your new test pass. Notice that the Dredd-powered test of
`/product/{slug}` is passing too, and your acceptance test is failing with a
different error now - the response does not contain all expected product
properties.

While it's possible to further iterate by adding more unit tests, a more
valuable next step is to write an integration test to verify that your new API
is using data from your backing database.

### Write an integration test for the new controller method

Create `tests/integration/product-controller.integration.ts` with the following
contents:

```ts
import {ProductController} from '../..';
import {expect} from '@loopback/testlab';

describe('ProductController (integration)', () => {
  beforeEach(givenEmptyDatabase);

  describe('getDetails()', () => {
    it('retrieves details of the given product', async () => {
      const inkPen = await givenProduct({
        name: 'Ink Pen',
        slug: 'ink-pen',
      });

      const pencil = await givenProduct({
        name: 'Pencil',
        slug: 'pencil',
      });

      const controller = new ProductController();

      const details = await controller.getDetails('pencil');

      expect(details).to.eql(pencil);
    });
  });

  async function givenEmptyDatabase() {
    // TODO
  }

  async function givenProduct(data: Object) {
    // TODO
    return Object.assign({}, data, {id: 1});
  }
});
```

Run `npm test` to see the new test fail.

```text
AssertionError: expected Object { name: 'Ink Pen', slug: 'ink-pen' } to equal Object { name: 'Pencil', slug: 'pencil', id: 1 } (at name, Ahas 'Ink Pen' and B has 'Pencil')
+ expected - actual

   {
  -  "name": "Ink Pen"
  -  "slug": "ink-pen"
  +  "id": 1
  +  "name": "Pencil"
  +  "slug": "pencil"
   }
```

Please refer to
[Test your Controllers and Repositories together](./Testing-your-application.md#test-your-controllers-and-repositories-together)
to learn more about integration testing.

Take a closer look at the new test. To make it fail with the current
implementation, you need to find a different scenario compared to what is
covered by the unit test. You could simply change the data, but that would add
little value to the test suite. Instead, take this opportunity to cover another
requirement of "get product details" operation: it should return the details of
the product that matches the "slug" parameter passed in the arguments.

The next step is bigger than is usual in an incremental TDD workflow. You need
to connect to the database and define classes to work with the data.

### Define Product model, repository, and data source

LoopBack is agnostic when it comes to accessing databases. You can choose any
package from the npm module ecosystem. On the other hand, we also want LoopBack
users to have a recommended solution that's covered by technical support.
Welcome to `@loopback/repository`, a TypeScript facade for the
`loopback-datasource-juggler` implementation in LoopBack 3.x.

1.  Define `Product` model in `src/models/product.model.ts`

    ```ts
    import {Entity, model, property} from '@loopback/repository';

    @model()
    export class Product extends Entity {
      @property({
        description: 'The unique identifier for a product',
        id: true,
      })
      id: number;

      @property({required: true})
      name: string;

      @property({required: true})
      slug: string;

      @property({required: true})
      price: number;

      // Add the remaining properties yourself:
      // description, available, category, label, endData
    }
    ```

    **TODO(bajtos) Find out how to re-use ProductBaseSchema for the model
    definition**

2.  Define a data source representing a single source of data, typically a
    database. This example uses in-memory storage. In real applications, replace
    the `memory` connector with the actual database connector (`postgresql`,
    `mongodb`, etc.).

    Create `src/datasources/db.datasource.ts` with the following content:

    ```ts
    import {juggler} from '@loopback/repository';

    export const db = new juggler.DataSource({
      connector: 'memory',
    });
    ```

3.  Define `ProductRepository` in `src/repositories/product.repository.ts`

    ```ts
    import {DefaultCrudRepository, DataSourceType} from '@loopback/repository';
    import {Product} from '../models/product.model';
    import {db} from '../datasources/db.datasource';

    export class ProductRepository extends DefaultCrudRepository<
      Product,
      typeof Product.prototype.id
    > {
      constructor() {
        super(Product, db);
      }
    }
    ```

See [Repositories](Repositories.md) for more details on this topic.

### Update test helpers and the controller use real model and repository

Rework `givenEmptyDatabase` and `givenProduct` as follows:

```ts
async function givenEmptyDatabase() {
  await new ProductRepository().deleteAll();
}

async function givenProduct(data: Partial<Product>) {
  return new ProductRepository().create(
    Object.assign(
      {
        name: 'a-product-name',
        slug: 'a-product-slug',
        price: 1,
        description: 'a-product-description',
        available: true,
      },
      data,
    ),
  );
}
```

Notice that `givenProduct` is filling in required properties with sensible
defaults. This is allow tests to provide only a small subset of properties that
are strictly required by the tested scenario. This is important for multiple
reasons:

1.  It makes tests easier to understand, because it's immediately clear what
    model properties are relevant to the test. If the test was setting all
    required properties, it would be difficult to tell whether some of those
    properties may be actually relevant to the tested scenario.

2.  It makes tests easier to maintain. As the data model evolves, you will
    eventually need to add more required properties. If the tests were building
    product instances manually, you would have to fix all tests to set the new
    required property. With a shared helper, there is only a single place where
    to add a value for the new required property.

You can learn more about test data builders in
[Use test data builders](./Testing-your-application.md#use-test-data-builders)
section of [Testing your application](./Testing-your-application.md).

Now that the tests are setting up the test data correctly, it's time to rework
`ProductController` to make the tests pass again.

```ts
import {ProductRepository} from '../repositories/product.repository';
import {Product} from '../models/product.model';

export class ProductController {
  repository: ProductRepository = new ProductRepository();

  async getDetails(slug: string): Promise<Product> {
    const found = await this.repository.find({where: {slug}});
    // TODO: handle "not found" case
    return found[0];
  }
}
```

### Run tests

Run the tests again. These results may surprise you:

1.  The acceptance test is failing: the response contains some expected
    properties (slug, name), but is missing most of other properties.

2.  The API smoke test is failing with a cryptic error.

3.  The unit test is passing, despite the fact that it's not setting up any data
    at all!

Examine the acceptance test first. A quick review of the source code should tell
us what's the problem - the test is relying on `givenEmptyDatabase` and
`givenProduct` helpers, but these helpers are not fully implemented yet. Fix
that by reusing the helpers from the integration test: Move the helpers to
`src/__tests__/helpers/database.helpers.ts` and update both the acceptance and
the integration tests to import the helpers from there.

To find out why the API smoke test is failing, you can start the application via
`node .` and request the tested endpoint for example using `curl`. You will see
that the server responds with 200 OK and an empty response body. This is because
`getDetails` returns `undefined` when no product matching the slug was found.
This can be fixed by adding a `before` hook to the smoke test. The hook should
populate the database with the test data assumed by the examples in the Swagger
specification by leveraging existing helpers `givenEmptyDatabase` and
`givenProduct`.

Now back to the first unit test. It may be a puzzle to figure out why the test
is passing, although the answer is simple: the integration and acceptance tests
are setting up data in the database, the unit test does not clear the database
(because it should not use it at all!) and accidentally happen to expect the
same data as one of the other tests.

### Decouple Controller from Repository

This shows us a flaw in the current design of the `ProductController` - it's
difficult to test it in isolation. Fix that by making the dependency on
`ModelRepository` explicit and allow controller users to provide a custom
implementation.

```ts
class ProductController {
  constructor(public repository: ProductRepository) {}

  // ...
}
```

{% include tip.html content="If you wanted to follow pure test-driven
development, then you would define a minimal repository interface describing
only the methods actually used by the controller. This will allow you to
discover the best repository API that serves the need of the controller.
However, you don't want to design a new repository API, you want to re-use the
repository implementation provided by LoopBack. Therefore using the actual
Repository class/interface is the right approach.
" %}

In traditional object-oriented languages like Java or C#, in order to allow the
unit tests to provide a custom implementation of the repository API, the
controller needs to depend on an interface describing the API, and the
repository implementation needs to implement this interface. The situation is
easier in JavaScript and TypeScript. Thanks to the dynamic nature of the
language, it's possible to mock/stub entire classes. The
[sinon](http://sinonjs.org/) testing module, which comes bundled in
`@loopback/testlab`, makes this very easy.

Here is the updated unit test leveraging dependency injection:

```ts
import {ProductController, ProductRepository} from '../..';
import {expect, sinon} from '@loopback/testlab';

describe('ProductController', () => {
  let repository: ProductRepository;
  beforeEach(givenStubbedRepository);

  describe('getDetails()', () => {
    it('retrieves details of a product', async () => {
      const controller = new ProductController(repository);
      const findStub = repository.find as sinon.SinonStub;
      findStub.resolves([
        {
          id: 1,
          name: 'Ink Pen',
          slug: 'ink-pen',
        },
      ]);

      const details = await controller.getDetails('ink-pen');

      expect(details).to.containDeep({
        name: 'Ink Pen',
        slug: 'ink-pen',
      });
      expect(findStub).to.be.calledWithMatch({where: {slug: 'ink-pen'}});
    });
  });

  function givenStubbedRepository() {
    repository = sinon.createStubInstance(ProductRepository);
  }
});
```

The new unit test is passing now, but the integration and acceptance tests are
broken again!

1.  Fix the integration test by changing how the controller is created - inject
    `new ProductRepository()` into the repository argument.

2.  Fix the acceptance test by annotating `ProductController`'s `repository`
    argument with `@inject('repositories.Product')` and binding the
    `ProductRepository` in the main application file where you are also binding
    controllers.

Learn more about this topic in
[Unit-test your Controllers](./Testing-your-application.md#unit-test-your-controllers)
and [Use test doubles](./Testing-your-application.md#use-test-doubles) from
[Testing your application](./Testing-your-application.md).

### Handle 'product not found' error

When you wrote the first implementation of `getDetails`, you assumed the slug
always refer to an existing product, which obviously is not always true. Fix the
controller to correctly handle this error situation.

Start with a failing unit test:

```ts
it('returns 404 Not Found for unknown slug', async () => {
  const controller = new ProductController(repository);
  const findStub = repository.find as sinon.SinonStub;
  findStub.resolves([]);

  try {
    await controller.getDetails('unknown-slug');
    throw new Error('getDetails should have thrown and error');
  } catch (err) {
    expect(err).to.have.property('statusCode', 404);
    expect(err.message).to.match(/not found/i);
  }
});
```

Then fix `getDetails` implementation:

```ts
// ...
import {HttpErrors} from '@loopback/rest';

export class ProductController {
  // ...

  async getDetails(slug: string): Promise<Product> {
    const found = await this.repository.find({where: {slug}});
    if (!found.length) {
      throw new HttpErrors.NotFound(`Slug not found: ${slug}`);
    }
    return found[0];
  }
}
```

More information on `HttpErrors` can be found in
[Controllers](./Controllers.md#handling-errors-in-controllers)

### Implement a custom Sequence

LoopBack 3.x is using Express middleware to customize the sequence of actions
executed to handle an incoming request: body-parser middleware is converting the
request body from JSON to a JavaScript object, strong-error-handler is creating
an error response when the request failed.

Express middleware has several shortcomings:

- It's based on callback flow control and does not support async functions
  returning Promises.
- The order in which middleware needs to be registered can be confusing, for
  example request logging middleware must be registered as the first one,
  despite the fact that the log is written only at the end, once the response
  has been sent.
- The invocation of middleware handlers is controlled by the framework,
  application developers have very little choices.

LoopBack 4, abandons Express/Koa-like middleware for a different approach that
puts the application developer in the front seat. See [Sequence](Sequence.md)
documentation to learn more about this concept.

Now you are going to modify request handling in the application to print a line
in the [Common Log Format](https://en.wikipedia.org/wiki/Common_Log_Format) for
each request handled.

Start by writing an acceptance test, as described in
[Test sequence customizations](Testing-your-application.md#test-sequence-customizations)
from [Testing your application](Testing-your-application.md). Create a new test
file (e.g. `sequence.acceptance.ts`) and add the following test:

```ts
describe('Sequence (acceptance)', () => {
  let app: HelloWorldApp;
  let request: Client;

  before(givenEmptyDatabase);
  beforeEach(givenRunningApp);

  it('prints a log line for each incoming request', async () => {
    const logs: string[] = [];
    const server = await app.getServer(RestServer);
    server
      .bind('sequence.actions.commonLog')
      .to((msg: string) => logs.push(msg));

    const product = await givenProduct({name: 'Pen', slug: 'pen'});
    await request.get('/product/pen');
    expect(logs).to.have.length(1);
    expect(logs[0]).to.match(
      /^(::ffff:)?127\.0\.0\.1 - - \[[^]+\] "GET \/product\/pen HTTP\/1.1" 200 -$/,
    );
  });
});
```

Run the test suite and watch the test fail.

In the next step, copy the default Sequence implementation to a new project file
`src/server/sequence.ts`:

```ts
const RestSequenceActions = RestBindings.SequenceActions;

export class MySequence implements SequenceHandler {
  constructor(
    @inject(RestSequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(RestSequenceActions.PARSE_PARAMS)
    protected parseParams: ParseParams,
    @inject(RestSequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(RestSequenceActions.SEND) protected send: Send,
    @inject(RestSequenceActions.REJECT) protected reject: Reject,
  ) {}

  async handle(context: RequestContext) {
    try {
      const {request, response} = context;
      const route = this.findRoute(request);
      const args = await this.parseParams(requset, route);
      const result = await this.invoke(route, args);
      this.send(response, result);
    } catch (err) {
      this.reject(context, err);
    }
  }
}
```

Register your new sequence with your `Server`, for example by calling
`server.sequence(MySequence)`. Run your tests to verify that everything works
the same way as before and the new acceptance test is still failing.

Now it's time to customize the default sequence to print a common log line. Edit
the `handle` method as follows:

```ts
async handle(context: RequestContext) {
  try {
    const {request, response} = context;
    const route = this.findRoute(request);
    const args = await this.parseParams(request, route);
    const result = await this.invoke(route, args);
    this.send(response, result);
    this.log([
      request.socket.remoteAddress,
      '-',
      '-',
      `[${strftime('%d/%b/%Y:%H:%M:%S %z', new Date())}]`,
      `"${request.method} ${request.path} HTTP/${request.httpVersion}"`,
      response.statusCode,
      '-',
    ].join(' '));
  } catch (err) {
    this.reject(context, err);
  }
}
```

To inject the new method `log`, add the following line to `MySequence`
constructor arguments:

```ts
@inject('sequence.actions.log') protected log: (msg: string) => void
```

When you run the tests now, you will see that the new acceptance tests for
logging passes, but some of the older acceptance tests started to fail. This is
because `sequence.actions.log` is not bound in the application. Fix that by
adding the following line after you've retrieved your rest server instance:

```ts
// assuming you've called `const server = await app.getServer(RestServer)`
server.bind('sequence.actions.log').to((msg: String) => console.log(msg));
```

With this last change in place, your test suite should be all green again.

The next task is left as an exercise for the reader: \\Modify the `catch` block
to print a common log entry too. Start by writing a unit-test that invokes
`MySequence` directly.

{% include next.html content= "
[Preparing the API for consumption](./Preparing-the-API-for-consumption.md)
" %}
