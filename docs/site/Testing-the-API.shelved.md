---
lang: en
title: 'Testing the API'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Testing-the-API.html
---

{% include previous.html content=" This article continues off
from [Defining and validating the API](./Defining-and-validating-the-API.md).
" %}

{% include important.html content="The top-down approach for building LoopBack
applications is not yet fully supported. Therefore, the steps outlined in this
page are outdated and may not work out of the box. They will be revisited after
our MVP release.
" %}

## Smoke test API input/output

Once you confirm that the API specification is valid, it's time to verify that
the application implements the API as you have specified it. The input/output
testing described below uses [Dredd](https://www.npmjs.com/package/dredd),
specifically `hello-world` in this section. Concrete sample code of
`hello-world` can be found in the
[hello-world tutorial](https://github.com/strongloop/loopback-next-hello-world)
repository. Although the sample code includes a validated API spec and fully
functional `hello-world` controller, let's pretend the controller is completely
empty. Try it yourself by cloning the repository from GitHub.

For input/output testing, you are going to create three parts:

1.  Input data definition.
2.  Expected output response definition.
3.  Test code.

Parts one and two are included in the API specification. The input data is given
as `x-example` as follows:

```js
"x-example": "Ted"
```

The expected output as `examples`:

```js
"examples": {
  "text/plain": "Hello world Ted."
}
```

The `Dredd` module reserves `x-example` to set the input parameter. the OpenAPI
standard defines the
[`examples` object](https://swagger.io/specification/#examples-object-92) as a
map from `MIME type` to the content value. Here, it's `text/plain` MIME type. As
you see, they are a pair: When you change the input value `x-example`, you must
change `examples` value as well.

The complete `hello-world` API specification is the following:

```js
export const controllerSpec = {
  swagger: '2.0',
  basePath: '/',
  info: {
    title: 'LoopBack Application',
    version: '1.0.0',
  },
  paths: {
    '/helloworld': {
      get: {
        'x-operation-name': 'helloWorld',
        parameters: [
          {
            name: 'name',
            in: 'query',
            description: 'Your name.',
            required: false,
            type: 'string',
            'x-example': 'Ted',
          },
        ],
        responses: {
          '200': {
            description: 'Returns a hello world with your (optional) name.',
            examples: {
              'text/plain': 'Hello world Ted.',
            },
          },
        },
      },
    },
  },
};
```

The third piece is the test code. To initialize the test environment, you need
to create a `Dredd` instance specifying the configuration. There are two
required fields in the configuration object: `server` and `options.path`.
`localhostAndPort + \'/swagger.json\'` is the predefined end point LoopBack 4
uses for the client to access the API specification of the service API.

```js
async function initEnvironment() {
  // By default, the port is set to 3000.
  const app: Application = new HelloWorldApp();
  const server = app.getServer(RestServer);
  // For testing, you'll let the OS pick an available port by setting
  // RestBindings.PORT to 0.
  server.bind(RestBindings.PORT).to(0);
  // app.start() starts up the HTTP server and binds the acquired port
  // number to RestBindings.PORT.
  await app.start();
  // Get the real port number.
  const port: number = await server.get(RestBindings.PORT);
  const localhostAndPort: string = 'http://localhost:' + port;
  const config: object = {
    server: localhostAndPort, // base path to the end points
    options: {
      level: 'fail', // report 'fail' case only
      silent: false, // false for helpful debugging info
      path: [localhostAndPort + '/swagger.json'], // to download apiSpec from the service
    },
  };
  dredd = new Dredd(config);
}
```

Since the specification above includes definition of input data and the expected
output, you have all the pieces to write the test code:

```js
describe('Api Spec End Points', () => {
  let dredd: any;
  before(initEnvironment);

  describe('input/output test', () => {

    it('passes match', done => {
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
  });

  async function initEnvironment() {
    //
    // see initEnvironment defined above.
    //
  });
})
```

Try running the first test:

```shell
$ npm test

  Api Spec End Points
    input/output test
fail: GET /helloworld?name=Ted duration: 26ms
fail: body: Real and expected data does not match.

request:
method: GET
uri: /helloworld?name=Ted
headers:
    User-Agent: Dredd/4.3.0 (Darwin 16.7.0; x64)
    Content-Length: 0
body:

expected:
headers:
    Content-Type: text/plain
body:
Hello world Ted
statusCode: 200

actual:
statusCode: 500
headers:
    date: Wed, 23 Aug 2017 00:17:48 GMT
    connection: close
    content-length: 0
body:

complete: 0 passing, 1 failing, 0 errors, 0 skipped, 1 total
complete: Tests took 27ms
```

The test report correctly shows that the input is `name=Ted` and the expected
result is `Hello world Ted`, but the actual result was `statusCode: 500` which
does not match the expectation. When the `hello-world` API is implemented, the
result would be something like the following:

```shell
$ npm test

  Api Spec End Points
    input/output test
complete: 1 passing, 0 failing, 0 errors, 0 skipped, 1 total
complete: Tests took 21ms
```

It's a powerful proposition to use the API specification not only for API
declaration but for test case declaration. The discussion so far paves the road
to "automated controller wireframe-code generation and test-driven development"
based on the OpenAPI standard.

At this point, you are ready to make these tests pass by coding up your business
logic.

Please refer to
[Perform an auto-generated smoke test of your REST API](Testing-your-application.md#perform-an-auto-generated-smoke-test-of-your-rest-api)
from [Testing your application](Testing-your-application.md) for more details.

{% include next.html content= "
[Defining your testing strategy](./Defining-your-testing-strategy.md)
" %}
