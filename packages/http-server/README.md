# @loopback/http-server

This package implements the HTTP / HTTPS server endpoint for LoopBack 4 apps.

## Overview

This is an internal package used by LoopBack 4 for creating HTTP / HTTPS server.

## Installation

To use this package, you'll need to install `@loopback/http-server`.

```sh
npm i @loopback/http-server
```

## Usage

`@loopback/http-server` should be instantiated with a request handler function,
and an HTTP / HTTPS options object.

```js
const httpServer = new HttpServer(
  (req, res) => {
    res.end('Hello world');
  },
  {port: 3000, host: ''},
);
```

Instance methods of `HttpServer`.

| Method    | Description       |
| --------- | ----------------- |
| `start()` | Starts the server |
| `stop()`  | Stops the server  |

Instance properties of `HttpServer`.

| Property   | Description            |
| ---------- | ---------------------- |
| `address`  | Address details        |
| `host`     | host of the server     |
| `port`     | port of the server     |
| `protocol` | protocol of the server |
| `url`      | url the server         |

## Contributions

- [Guidelines](https://github.com/loopbackio/loopback-next/wiki/Contributing#guidelines)
- [Join the team](https://github.com/loopbackio/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/loopbackio/loopback-next/graphs/contributors).

## License

MIT
