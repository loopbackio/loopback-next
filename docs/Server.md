---
lang: en
title: 'Server'
keywords: LoopBack 4.0, LoopBack 4
tags:
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Server.html
summary:
---

## Overview

The [Server](https://apidocs.strongloop.com/@loopback%2fcore/#Server) interface defines the minimal required functions (start and stop) to implement for a LoopBack application. Servers in LoopBack 4 are used to represent implementations for inbound transports and/or protocols such as REST over http, gRPC over http2, graphQL over https, etc. They typically listen for requests on a specific port, handle them, and return appropriate responses. A single application can have multiple server instances listening on different ports and working with different protocols.


## Usage

LoopBack 4 currently offers the [`@loopback/rest`](https://github.com/strongloop/loopback-next/tree/master/packages/rest) package out of the box which provides an HTTP based server implementation handling requests over REST called `RestServer`. In order to use it in your application, all you need to do is have your application class extend `RestApplication`, and it will provide you with an instance of RestServer listening on port 3000. The following shows how to make use of it:

```ts
import {RestApplication, RestServer} from '@loopback/rest';

export class HelloWorldApp extends RestApplication {
  constructor() {
    super();
  }

  async start() {
    // get a singleton HTTP server instance
    const rest = await this.getServer(RestServer);
    // give our RestServer instance a sequence handler function which
    // returns the Hello World string for all requests
    rest.handler((sequence, request, response) => {
      sequence.send(response, 'Hello World!');
    });
    // call start on application class, which in turn starts all registered
    // servers
    await super.start();
    console.log(`REST server running on port: ${await rest.get('rest.port')}`);
  }
}
```

## Configuration

### Add servers to application instance

You can add server instances to your application via the `app.server()` method individually or as an array using `app.servers()` method. Using `app.server()` allows you to uniquely name your binding key for your specific server instance. The following example demonstrates how to use these functions:

```ts
import {RestApplication, RestServer} from '@loopback/rest';

export class HelloWorldApp extends RestApplication {
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

You can also add multiple servers in the constructor of your application class as shown [here](Application.md#servers).

## Next Steps

- Learn about [Server-level Context](Context.md#server-level-context)
- Learn more about [creating your own servers!](Creating-components.md#creating-your-own-servers)
