---
lang: en
title: 'Server'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Server.html
---

## Overview

The [Server](https://apidocs.strongloop.com/@loopback%2fdocs/core.html#Server)
interface defines the minimal required functions (start and stop) and a
'listening' property to implement for a LoopBack application. Servers in
LoopBack 4 are used to represent implementations for inbound transports and/or
protocols such as REST over http, gRPC over http2, graphQL over https, etc. They
typically listen for requests on a specific port, handle them, and return
appropriate responses. A single application can have multiple server instances
listening on different ports and working with different protocols.

## Usage

LoopBack 4 offers the
[`@loopback/rest`](https://github.com/strongloop/loopback-next/tree/master/packages/rest)
package out of the box, which provides HTTP/HTTPS based server called
`RestServer` for handling REST requests.

In order to use it in your application, all you need to do is have your
application class extend `RestApplication`, and it will provide you with an
instance of RestServer listening on port 3000. The following shows how to make
use of it:

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

### Enable HTTPS

Enabling HTTPS for the LoopBack REST server is just a matter of specifying the
protocol as `https` and specifying the credentials.

In the following app we configure HTTPS for a bare miminum app using a key +
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

### Add servers to application instance

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
