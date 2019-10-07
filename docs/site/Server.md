---
lang: en
title: 'Server'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Server.html
---

## Overview

The [Server](https://loopback.io/doc/en/lb4/apidocs.core.server.html) interface
defines the minimal required functions (start and stop) and a 'listening'
property to implement for a LoopBack application. Servers in LoopBack 4 are used
to represent implementations for inbound transports and/or protocols such as
REST over http, gRPC over http2, graphQL over https, etc. They typically listen
for requests on a specific port, handle them, and return appropriate responses.
A single application can have multiple server instances listening on different
ports and working with different protocols.

## Usage

LoopBack 4 offers the
[`@loopback/rest`](https://github.com/strongloop/loopback-next/tree/master/packages/rest)
package out of the box, which provides an HTTP/HTTPS-based server called
`RestServer` for handling REST requests.

In order to use it in your application, your application class needs to extend
`RestApplication` to provide an instance of RestServer listening on port 3000.
The following example shows how to use `RestApplication`:

```ts
import {RestApplication, RestServer} from '@loopback/rest';

export class HelloWorldApp extends RestApplication {
  constructor() {
    super();
    // give our RestServer instance a sequence handler function which
    // returns the Hello World string for all requests
    // with RestApplication, handler function can be registered
    // at app level
    this.handler((sequence, request, response) => {
      sequence.send(response, 'Hello World!');
    });
  }

  async start() {
    // call start on application class, which in turn starts all registered
    // servers
    await super.start();

    // get a singleton HTTP server instance
    const rest = await this.getServer(RestServer);
    console.log(`REST server running on port: ${await rest.get('rest.port')}`);
  }
}
```

## Configuration

The REST server can be configured by passing a `rest` property inside your
RestApplication options. For example, the following code customizes the port
number that a REST server listens on.

```ts
const app = new RestApplication({
  rest: {
    port: 3001,
  },
});
```

### Customize How OpenAPI Spec is Served

There are a few options under `rest.openApiSpec` to configure how OpenAPI spec
is served by the given REST server.

- servers: Configure servers for OpenAPI spec
- setServersFromRequest: Set `servers` based on HTTP request headers, default to
  `false`
- disabled: Set to `true` to disable endpoints for the OpenAPI spec. It will
  disable API Explorer too.
- endpointMapping: Maps urls for various forms of the spec. Default to:

```js
    {
      '/openapi.json': {version: '3.0.0', format: 'json'},
      '/openapi.yaml': {version: '3.0.0', format: 'yaml'},
    }
```

```ts
const app = new RestApplication({
  rest: {
    openApiSpec: {
      servers: [{url: 'http://127.0.0.1:8080'}],
      setServersFromRequest: false,
      endpointMapping: {
        '/openapi.json': {version: '3.0.0', format: 'json'},
        '/openapi.yaml': {version: '3.0.0', format: 'yaml'},
      },
    },
  },
});
```

### Configure the API Explorer

LoopBack allows externally hosted API Explorer UI to render the OpenAPI
endpoints for a REST server. Such URLs can be specified with `rest.apiExplorer`:

- url: URL for the hosted API Explorer UI, default to
  `https://loopback.io/api-explorer`.
- httpUrl: URL for the API explorer served over plain http to deal with mixed
  content security imposed by browsers as the spec is exposed over `http` by
  default. See https://github.com/strongloop/loopback-next/issues/1603. Default
  to the value of `url`.

```ts
const app = new RestApplication({
  rest: {
    apiExplorer: {
      url: 'https://petstore.swagger.io',
      httpUrl: 'http://petstore.swagger.io',
    },
  },
});
```

#### Disable redirect to API Explorer

To disable redirect to the externally hosted API Explorer, set the config option
`rest.apiExplorer.disabled` to `true`.

```ts
const app = new RestApplication({
  rest: {
    apiExplorer: {
      disabled: true,
    },
  },
});
```

### Use a self-hosted API Explorer

Hosting the API Explorer at an external URL has a few downsides, for example a
working internet connection is required to explore the API. As a recommended
alternative, LoopBack comes with an extension that provides a self-hosted
Explorer UI. Please refer to
[Self-hosted REST API Explorer](./Self-hosted-REST-API-Explorer.md) for more
details.

### Enable HTTPS

Enabling HTTPS for the LoopBack REST server is just a matter of specifying the
protocol as `https` and specifying the credentials.

In the following app, we configure HTTPS for a bare minimum app using a key +
certificate chain variant.

```ts
import {RestApplication, RestServer, RestBindings} from '@loopback/rest';
import * as fs from 'fs';

export async function main() {
  const options = {
    rest: {
      protocol: 'https',
      key: fs.readFileSync('./key.pem'),
      cert: fs.readFileSync('./cert.pem'),
    },
  };
  const app = new RestApplication(options);
  app.handler(handler => {
    handler.response.send('Hello');
  });
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
}
```

### Customize CORS

[CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) is enabled
by default for REST servers with the following options:

```ts
{
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400,
  credentials: true,
}
```

The application code can customize CORS via REST configuration:

```ts
export async function main() {
  const options = {
    rest: {
      cors: {...},
    },
  };
  const app = new RestApplication(options);
}
```

For a complete list of CORS options, see
https://github.com/expressjs/cors#configuration-options.

### Express settings

Override the default express settings and/or assign your own settings:

```ts
const app = new RestApplication({
  rest: {
    expressSettings: {
      'x-powered-by': false,
      env: 'production',
      ...
    },
  },
});
```

Checkout `express` [documentation](http://expressjs.com/fr/api.html#app.set) for
more details about the build-in settings.

### Configure the Base Path

Sometime it's desirable to expose REST endpoints using a base path, such as
`/api`. The base path can be set as part of the RestServer configuration.

```ts
const app = new RestApplication({
  rest: {
    basePath: '/api',
  },
});
```

The `RestApplication` and `RestServer` both provide a `basePath()` API:

```ts
const app: RestApplication;
// ...
app.basePath('/api');
```

With the `basePath`, all REST APIs and static assets are served on URLs starting
with the base path.

### Configure the router

The router can be configured to enforce `strict` mode as follows:

1. `strict` is true:

- request `/orders` matches route `/orders` but not `/orders/`
- request `/orders/` matches route `/orders/` but not `/orders`

2. `strict` is false (default)

- request `/orders` matches route `/orders` first and falls back to `/orders/`
- request `/orders/` matches route `/orders/` first and falls back to `/orders`

See `strict routing` at http://expressjs.com/en/4x/api.html#app for more
information.

### Configure the request body parser options

We can now configure request body parser options as follows:

```ts
const app = new Application({
  rest: {requestBodyParser: {json: {limit: '1mb'}}},
});
```

The value of `rest.requestBodyParser` will be bound to
RestBindings.REQUEST_BODY_PARSER_OPTIONS. See
[Customize request body parser options](Parsing-requests.md#customize-parser-options)
for more details.

### `rest` options

| Property          | Type                      | Purpose                                                                                                   |
| ----------------- | ------------------------- | --------------------------------------------------------------------------------------------------------- |
| host              | string                    | Specify the hostname or ip address on which the RestServer will listen for traffic.                       |
| port              | number                    | Specify the port on which the RestServer listens for traffic.                                             |
| protocol          | string (http/https)       | Specify the protocol on which the RestServer listens for traffic.                                         |
| basePath          | string                    | Specify the base path that RestServer exposes http endpoints.                                             |
| key               | string                    | Specify the SSL private key for https.                                                                    |
| cert              | string                    | Specify the SSL certificate for https.                                                                    |
| cors              | CorsOptions               | Specify the CORS options.                                                                                 |
| sequence          | SequenceHandler           | Use a custom SequenceHandler to change the behavior of the RestServer for the request-response lifecycle. |
| openApiSpec       | OpenApiSpecOptions        | Customize how OpenAPI spec is served                                                                      |
| apiExplorer       | ApiExplorerOptions        | Customize how API explorer is served                                                                      |
| requestBodyParser | RequestBodyParserOptions  | Customize how request body is parsed                                                                      |
| router            | RouterOptions             | Customize how trailing slashes are used for routing                                                       |
| listenOnStart     | boolean (default to true) | Control if the server should listen on http/https when it's started                                       |

## Add servers to application instance

You can add server instances to your application via the `app.server()` method
individually or as an array using `app.servers()` method. Using `app.server()`
allows you to uniquely name your binding key for your specific server instance.
The following example demonstrates how to use these functions:

```ts
import {Application} from '@loopback/core';
import {RestServer} from '@loopback/rest';

export class HelloWorldApp extends Application {
  constructor() {
    super();
    // This server instance will be bound under "servers.fooServer".
    this.server(RestServer, 'fooServer');
    // Creates a binding for "servers.MQTTServer" and a binding for
    // "servers.SOAPServer";
    this.servers([MQTTServer, SOAPServer]);
  }
}
```

You can also add multiple servers in the constructor of your application class
as shown [here](Application.md#servers).

## Next Steps

- Learn about [Server-level Context](Context.md#server-level-context)
- Learn more about
  [creating your own servers!](Creating-components.md#creating-your-own-servers)
