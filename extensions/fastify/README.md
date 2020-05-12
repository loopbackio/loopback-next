# @loopback/fastify

A lightweight REST server powered by [fastify](https://fastify.io) 🏎

## Stability: ⚠️Experimental⚠️

> Experimental packages provide early access to advanced or experimental
> functionality to get community feedback. Such modules are published to npm
> using `0.x.y` versions. Their APIs and functionality may be subject to
> breaking changes in future releases.

_WARNING: This is a speculative project with a low priority and a high chance of
getting abandoned. Use at your own risk!_

## Installation

```sh
npm i @loopback/fastify
```

## Basic use

Use `FastifyMixin` to add a fastify instance to your `Application`.

```ts
export class MyApplication extends FastifyMixin(
  BootMixin(ServiceMixin(RepositoryMixin(Application))),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);
    this.projectRoot = __dirname;

    // Use the same controller classes as with `@loopback/rest`
    this.controller(MyController);

    // Access the fastify instance via `this.fastify`
    this.fastify.register(require('fastify-cors'), {
      // CORS options
    });
  }
}
```

## Design goals

_Use this experiment to drive refactoring and cleanup of `@loopback/rest` and
related packages, to extract reusable blocks that can be shared by our packages
and 3rd-parties too. Build a better understanding of what is needed to build a
new transport (server) implementation, make it easier to build custom transports
by improving frameworks APIs and documentation._

- A lightweight bridge between LoopBack Controllers and Fastify HTTP engine.
  [KISS](https://en.wikipedia.org/wiki/KISS_principle) and
  [YAGNI](https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it)!

- Don't reinvent the wheel, outsource as much work to Fastify ecosystem as
  possible. Use Fastify concepts for middleware, logging, etc.

- Prefer runtime performance over flexibility & extensibility. Users are
  encouraged to use `@loopback/rest` if extensibility is important in their
  projects.

- Use DI/IoC sparingly. While it's a powerful concept, it adds significant
  overhead too: it's more difficult to understand the system as a whole and
  there are runtime performance penalties.

## MVP scope

A Todo example app with REST API Explorer.

**v0.1**

- [x] FastifyMixin (replacing RestServer and RestApplication)
- [x] Controller registration (`app.controller()`)
- [x] OpenAPI-based routing
- [ ] Documentation for Server Extension developers
- [ ] OpenAPI-based parameter parsing & response schemas
- [ ] Tests to verify support for APIs produced by `rest-crud` model api builder
- [ ] Benchmark
- [ ] Code cleanup (initial)

**next**

- [ ] Error handler (based on strong-error-handler?)
- [ ] REST API Explorer, preferably using `@loopback/rest-explorer`. This will
      probably require:
  - [ ] Serving static files (`app.static()`) - can we find a declarative way
        how components can export something like a "static assets route"?
  - [ ] Redirect routes (can we use Fastify API instead?)
- [ ] OpenAPI configuration (automatically populate `servers` fields, etc.)

## Post MVP

- `/openapi.json` endpoint
- OpenAPI schema enhancers & consolidation
- File uploads & downloads
- Interceptors & method-argument-level dependency injection. We must be very
  careful to avoid performance degradation.
- Logging powered by fastify's Pino-based loggers (per-app, per-request)
- Build OpenAPI schema for routes contributed via `app.fastify`
- Add `fastify.loopback` pointing to app-level and request-level Context
- HTTP/2 support
- LB4 handler-based routes (endpoints)
- Multiple servers per one application

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
