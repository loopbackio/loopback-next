---
lang: en
title: 'Server'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI
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

## Common tasks

- [Enable HTTPS](./guides/deployment/enabling-https.md)
- [Customize how OpenAPI spec is served](./guides/rest/customize-openapi.md)
- [Customizing Server configuration](./Customizing-server-configuration.md)

## Usage

LoopBack 4 offers the
[`@loopback/rest`](https://github.com/loopbackio/loopback-next/tree/master/packages/rest)
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

## Next Steps

- Learn about [Server-level Context](Context.md#server-level-context)
- Learn more about
  [creating your own servers!](Creating-components.md#creating-your-own-servers)
