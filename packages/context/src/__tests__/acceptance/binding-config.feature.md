# Feature: Context bindings - injecting configuration for bound artifacts

- In order to receive configuration for a given binding
- As a developer
- I want to set up configuration for a binding key
- So that configuration can be injected by the IoC framework

# Scenario: configure an artifact before it's bound

- Given a `Context`
- Given a class RestServer with a constructor accepting a single argument
  `config: RestServerConfig`
- Given `RestServer` ctor argument is decorated with `@config()`
- When I bind a configuration object `{port: 3000}` to
  `servers.rest.server1:$config`
- And bind the rest server to `servers.rest.server1`
- And resolve the binding for `servers.rest.server1`
- Then I get a new instance of `RestServer`
- And the instance was created with `config` set to `{port: 3000}`

```ts
class RestServer {
  constructor(@config() public config: RestServerConfig) {}
}

const ctx = new Context();

// Bind configuration
ctx.configure('servers.rest.server1').to({port: 3000});

// Bind RestServer
ctx.bind('servers.rest.server1').toClass(RestServer);

// Resolve an instance of RestServer
// Expect server1.config to be `{port: 3000}
const server1 = await ctx.get('servers.rest.server1');
```

# Scenario: configure an artifact with a dynamic source

- Given a `Context`
- Given a class RestServer with a constructor accepting a single argument
  `config: RestServerConfig`
- Given `RestServer` ctor argument is decorated with `@config()`
- When I bind a configuration factory of `{port: 3000}` to
  `servers.rest.server1:$config`
- And bind the rest server to `servers.rest.server1`
- And resolve the binding for `servers.rest.server1`
- Then I get a new instance of `RestServer`
- And the instance was created with `config` set to `{port: 3000}`

```ts
class RestServer {
  constructor(@config() public config: RestServerConfig) {}
}

const ctx = new Context();

// Bind configuration
ctx
  .configure('servers.rest.server1')
  .toDynamicValue(() => Promise.resolve({port: 3000}));

// Bind RestServer
ctx.bind('servers.rest.server1').toClass(RestServer);

// Resolve an instance of RestServer
// Expect server1.config to be `{port: 3000}
const server1 = await ctx.get('servers.rest.server1');
```

# Notes

This document only captures the expected behavior at context binding level. It
establishes conventions to configure and resolve binding.

Sources of configuration can be one or more files, databases, distributed
registries, or services. How such sources are discovered and loaded is out of
scope.

See the following modules as candidates for configuration management facilities:

- https://github.com/lorenwest/node-config
- https://github.com/mozilla/node-convict
