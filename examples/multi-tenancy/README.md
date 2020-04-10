# @loopback/example-multi-tenancy

An example application to demonstrate how to implement multi-tenancy with
LoopBack 4.

## Key artifacts

### MultiTenancyStrategy

This interface defines the contract for multi-tenancy strategies to implement
the logic to identify a tenant and bind tenant specific resources to the request
context.

```ts
/**
 * Interface for a multi-tenancy strategy to implement
 */
export interface MultiTenancyStrategy {
  /**
   * Name of the strategy
   */
  name: string;
  /**
   * Identify the tenant for a given http request
   * @param requestContext - Http request
   */
  identifyTenant(
    requestContext: RequestContext,
  ): ValueOrPromise<Tenant | undefined>;

  /**
   * Bind tenant-specific resources for downstream artifacts with dependency
   * injection
   * @param requestContext - Request context
   */
  bindResources(
    requestContext: RequestContext,
    tenant: Tenant,
  ): ValueOrPromise<void>;
}
```

### MultiTenancyActionProvider

`MultiTenancyActionProvider` serves two purposes:

- Provides an action (`MultiTenancyAction`) for the REST sequence to enforce
  multi-tenancy
- Exposes an extension point to plug in multi-tenancy strategies

### Implement MultiTenancyStrategy

The example includes a few simple implementations of `MultiTenancyStrategy`:

#### Identify tenant id for a given http request

- JWTStrategy - use JWT token from `Authorization` header
- HeaderStrategy - use `x-tenant-id` header
- QueryStrategy - use `tenant-id` query parameter
- HostStrategy - use `host` header

#### Bind tenant specific resources to the request context

We simply rebind `datasources.db` to a tenant specific datasource to select the
right datasource for `UserRepository`.

```ts
  bindResources(
    requestContext: RequestContext,
    tenant: Tenant,
  ): ValueOrPromise<void> {
    requestContext
      .bind('datasources.db')
      .toAlias(`datasources.db.${tenant.id}`);
  }
```

### Register multi-tenancy strategies

Multi-tenancy strategies are registered to the extension point using
`extensionFor` template:

```ts
app.add(
  createBindingFromClass(JWTStrategy).apply(
    extensionFor(MULTI_TENANCY_STRATEGIES),
  ),
);
```

We group multiple registrations in `src/multi-tenancy/component.ts` using the
`MultiTenancyComponent`:

```ts
export class MultiTenancyComponent implements Component {
  bindings = [
    // Add the action
    createBindingFromClass(MultiTenancyActionProvider, {
      key: MultiTenancyBindings.ACTION,
    }),
    // Add strategies
    createBindingFromClass(JWTStrategy).apply(
      extensionFor(MULTI_TENANCY_STRATEGIES),
    ),
    createBindingFromClass(HeaderStrategy).apply(
      extensionFor(MULTI_TENANCY_STRATEGIES),
    ),
    createBindingFromClass(QueryStrategy).apply(
      extensionFor(MULTI_TENANCY_STRATEGIES),
    ),
    createBindingFromClass(HostStrategy).apply(
      extensionFor(MULTI_TENANCY_STRATEGIES),
    ),
  ];
}
```

### Configure what strategies to be used

The `MultiTenancyAction` can be configured with what strategies are checked in
order.

```ts
app
  .configure<MultiTenancyActionOptions>(MultiTenancyBindings.ACTION)
  .to({strategyNames: ['jwt', 'header', 'query']});
```

### Register MultiTenancyAction

`MultiTenancyAction` is added to `src/sequence.ts` so that REST requests will be
intercepted to enforce multiple tenancy before other actions.

```ts
export class MySequence implements SequenceHandler {
  constructor(
    // ...
    @inject(MultiTenancyBindings.ACTION)
    public multiTenancy: MultiTenancyAction,
  ) {}

  async handle(context: RequestContext) {
    try {
      const {request, response} = context;
      await this.multiTenancy(context);
      // ...
    } catch (err) {
      this.reject(context, err);
    }
  }
}
```

## Use

```sh
npm start
```

The strategies expect clients to set tenant id for REST API requests.

- `jwt`: set `Authorization` header as
  `Authorization: Bearer <signed-jwt-token>`
- `header`: set `x-tenant-id` header as `x-tenant-id: <tenant-id>`
- `query`: set `tenant-id` query parameter, such as: `?tenant-id=<tenant-id>`

Check out acceptance tests to understand how to pass tenant id using different
strategies:

- src/tests/acceptance/user.controller.header.acceptance.ts
- src/tests/acceptance/user.controller.jwt.acceptance.ts

You can use environment variable `DEBUG=loopback:multi-tenancy:*` to print out
information about the multi-tenancy actions.

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
