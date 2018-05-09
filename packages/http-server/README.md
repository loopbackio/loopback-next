# @loopback/http-server

This module defines common interfaces/types to create endpoints for http
protocols.

Interfaces for http server providers to extend or implement:

- BaseHttpContext: wrapper for Node.js core http req/res and framework specific request/response
- BaseHandleHttp: function to handle http requests/responses
- HttpEndpointFactory: factory to create http endpoints

Interfaces for `@loopback/rest` and other modules to consume:

- Request: framework specific http request
- Response: framework specific http response
- HttpContext: http context with framework specific request/response
- HandleHttp: http handler with framework specific request/response

- HttpServerConfig: configuration for an http/https server
- HttpEndpoint: server/url/...

To implement the contract for `http-server` using a framework such as `express`
or `koa`, follow the steps below:

1. Add a new package such as `@loopback/http-server-express`.

2. Define a class to implement `HttpEndpointFactory`

3. Export framework specific types:

```ts
export type Request = ...; // The framework specific Request
export type Response = ...; // The framework specific Response
export type HttpContext = BaseHttpContext<Request, Response>;
export type HandleHttp = BaseHandleHttp<Request, Response>;
```

4. Export `ENDPOINT_FACTORY` as a singleton of `HttpEndpointFactory`.

```ts
export const ENDPOINT_FACTORY: HttpEndpointFactory<
  Request,
  Response
> = new CoreHttpEndpointFactory();
```

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/wiki/Contributing#guidelines)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See [all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
