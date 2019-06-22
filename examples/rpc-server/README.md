# @loopback/example-rpc-server

An example RPC server and application to demonstrate the creation of your own
custom server.

[![powered-by-loopback]](http://loopback.io/)

## Usage

1.  Install the new loopback CLI toolkit.

```sh
npm i -g @loopback/cli
```

2.  Download the "rpc-server" application.

```sh
lb4 example rpc-server
```

3.  Switch to the directory.

```sh
cd loopback-example-rpc-server
```

4.  Start the app!

```sh
npm start
```

Next, use your favorite REST client to send RPC payloads to the server (hosted
on port 3000).

## Request Format

The request body should contain a controller name, method name and input object.
Example:

```json
{
  "controller": "GreetController",
  "method": "basicHello",
  "input": {
    "name": "Janet"
  }
}
```

The router will determine which controller and method will service your request
based on the given names in the payload.

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
