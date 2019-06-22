---
lang: en
title: 'Creating servers'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Creating-servers.html
---

## Creating your own servers

LoopBack 4 has the concept of a Server, which you can use to create your own
implementations of REST, SOAP, gRPC, MQTT and more. For an overview, see
[Server](Server.md).

Typically, you'll want server instances that listen for traffic on one or more
ports (this is why they're called "servers", after all). This leads into a key
concept to leverage for creating your custom servers.

### Controllers and routing

LoopBack 4 developers are strongly encouraged to use controllers for their
modules, and this naturally leads to the concept of routing.

No matter what protocol you intend to use for your custom server, you'll need to
use some algorithm to determine _which_ controller and function to send request
data to, and that means you need a router.

For example, consider a "toy protocol" similar to the JSON RPC specification
(but nowhere near as complete or robust).

The toy protocol will require a JSON payload with three properties:
`controller`, `method`, and `input`.

An example request would look something like this:

```json
{
  "controller": "GreetController",
  "method": "basicHello",
  "input": {
    "name": "world"
  }
}
```

You can find the code for our sample RPC server implementation
[over here](https://github.com/strongloop/loopback-next/tree/master/examples/rpc-server).

### Trying it out

First, install your dependencies and then start the application:

```
npm i && npm start
```

Now, try it out: start the server and run a few REST requests. Feel free to use
whatever REST client you'd prefer (this example will use `curl`).

```sh
# Basic Greeting Calls
$ curl -X POST -d '{ "controller": "GreetController", "method": "basicHello" }' -H "Content-Type: application/json" http://localhost:3000/
Hello, World!
$ curl -X POST -d '{ "controller": "GreetController", "method": "basicHello", "input": { "name": "Nadine" } }' -H "Content-Type: application/json" http://localhost:3000/
Hello, Nadine!
# Advanced Greeting Calls
$ curl -X POST -d '{ "controller": "GreetController", "method": "hobbyHello", "input": { "name": "Nadine" } }' -H "Content-Type: application/json" http://localhost:3000/
Hello, Nadine! I heard you like underwater basket weaving.
$ curl -X POST -d '{ "controller": "GreetController", "method": "hobbyHello", "input": { "name": "Nadine", "hobby": "extreme mountain biking" } }' -H "Content-Type: application/json" http://localhost:3000/
Hello, Nadine! I heard you like extreme mountain biking.
```

While a typical protocol server would be a lot more involved in the
implementation of both its router and server, the general concept remains the
same, and you can use these tools to make whatever server you'd like.

### Other considerations

Some additional concepts to add to your server could include:

- Pre-processing of requests (changing content types, checking the request body,
  etc)
- Post-processing of responses (removing sensitive/useless information)
- Caching
- Logging
- Automatic creation of default endpoints
- and more...

LoopBack 4's modularity allows for custom servers of all kinds, while still
providing key utilities like context and injection to make your work easier.
