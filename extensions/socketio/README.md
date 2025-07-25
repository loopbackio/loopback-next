# @loopback/socketio

Stability: :warning: Experimental :warning:

This module uses [socket.io](http://socket.io) to expose controllers as
WebSocket friendly endpoints.

## Use Cases

1. A real time application would like to use WebSocket friendly APIs to manage
   subscriptions, participants (rooms) and message exchanges.

2. Make it easy for API developers to expose WebSocket friendly APIs without
   learning a lot of low level concepts.

3. Use it as a step stone to explore messaging oriented API paradigms and
   programming models, such as pub/sub, eventing, streaming, and reactive.

## High Level Design

The package will provide the following key constructs:

- SocketIoServer: A new server type that listens on incoming WebSocket
  connections and dispatches messages to controllers that subscribe to the
  namespace. Each server is attached to an http/https endpoint.

- SocketIo controller: A controller class that is decorated with SocketIo
  related metadata, including:
  - Map to a namespace
  - Connect/disconnect events
  - Subscribe/consume messages
  - Publish/produce messages

- SocketIo middleware or sequence
  - Allow common logic to intercept/process WebSocket messages

## Basic Use

1. Create a SocketIoServer
2. Define a controller to handle socket.io events/messages
3. Register the controller
4. Discover socket.io controllers and mount them to the SocketIoServer
   namespaces.

## Sample application

[socket.io](https://github.com/loopbackio/loopback-next/tree/master/examples/socketio)

## Installation

```sh
npm install --save @loopback/socketio
```

## Contributions

- [Guidelines](https://github.com/loopbackio/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/loopbackio/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/loopbackio/loopback-next/graphs/contributors).

## License

MIT
