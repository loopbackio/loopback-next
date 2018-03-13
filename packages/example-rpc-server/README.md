# @loopback/example-rpc-server

An example RPC server and application to demonstrate the creation of your
own custom server.

[![LoopBack]https://github.com/strongloop/loopback-next/blob/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-%402x.png](http://loopback.io/)

## Usage

1. Install the new loopback CLI toolkit.
```
npm i -g @loopback/cli
```

2. Download the "rpc-server" application.
```
lb4 example rpc-server
```

3. Switch to the directory and install dependencies.
```
cd loopback-example-rpc-server && npm i
```

4. Start the app!
```
npm start
```

Next, use your favourite REST client to send RPC payloads to the server
(hosted on port 3000).

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

