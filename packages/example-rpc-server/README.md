# @loopback/example-rpc-server

An example RPC server and application to demonstrate the creation of your
own custom server.

[![LoopBack](http://loopback.io/images/overview/powered-by-LB-xs.png)](http://loopback.io/)

## Usage

1. Install the new loopback CLI toolkit.
```
npm i -g @loopback/cli
```

2. Download the "getting-started" application.
```
lb4 example getting-started
```

3. Switch to the directory and install dependencies.
```
cd loopback4-example-getting-started && npm i
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

