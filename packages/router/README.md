# @loopback/router

HTTP(s) server router using OpenAPI Spec/Swagger to define HTTP endpoints and Controller pattern to implement them.

## Overview

TBD

## Installation

```
$ npm install --save @loopback/router
```

## Basic use

### 1. Create a router instance

```ts
import {SwaggerRouter} from '@loopback/router';

const router = new SwaggerRouter();
```

### 2. Define your REST API

Create OpenAPI Spec/Swagger document describing a part of your API
that will be implemented by a single controller
(or load it from a YAML file):

  ```ts
  const spec = {
      basePath: '/',
      paths: {
      '/echo': {
        get: {
          'x-operation-name': 'echo',
          parameters: [
            {
              name: 'msg',
              in: 'query',
              type: 'string',
            },
          ]
          responses: {
            '200': {
              type: 'string'
            }
          }
        }
      }
    }
  };
  ```

Notice the custom extension `x-operation-name`, which provides a name of the
controller method implementing this endpoint.

### 3. Implement the controller

Controllers are regular classes where each public method implements
a single REST endpoint. The router creates a new controller instance
for each incoming request.

```ts
class HelloController {
  public async echo(msg : string): Promise<string> {
    return `Echo ${msg}`;
  }
}
```

### 4. Register your Controller with the router

```ts
router.controller((req, res) => new Controller(), spec);
```

### 5. Start the app

`router.handler` provides a handler function that can be passed directly
to `http.createServer`:

```ts
import * as http from 'http';

http.createServer(router.handler).listen(3000);
```

The handler can be mounted as an Express middleware too:

```ts
import * as express from 'express';

const app = express();
app.use(router.handle);
app.listen();
```

## Related resources

See https://www.openapis.org/ and [version 2.0](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md)
of OpenAPI Specification.

## Contributions

IBM/StrongLoop is an active supporter of open source and welcomes contributions to our projects as well as those of the Node.js community in general. For more information on how to contribute please refer to the [Contribution Guide](https://loopback.io/doc/en/contrib/index.html).

## License

MIT
