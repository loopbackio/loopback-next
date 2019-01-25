---
lang: en
title: 'Dependency injection'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Dependency-injection.html
---

## Introduction

[Dependency Injection](https://en.wikipedia.org/wiki/Dependency_injection) is a
technique where the construction of dependencies of a class or function is
separated from its behavior, in order to keep the code
[loosely coupled](https://en.wikipedia.org/wiki/Loose_coupling).

For example, the Sequence Action `authenticate` supports different
authentication strategies (e.g. HTTP Basic Auth, OAuth2, etc.). Instead of
hard-coding some sort of a lookup table to find the right strategy instance,
`authenticate` uses dependency injection to let the caller specify which
strategy to use.

The example below shows a simplified implementation of `authenticate` action,
please refer to the source code of `@loopback/authenticate` for the full working
version.

```ts
class AuthenticateActionProvider {
  constructor(@inject(AuthenticationBindings.STRATEGY) strategy) {
    this.strategy = strategy;
  }

  value(): AuthenticateFn {
    return request => this.action(request);
  }

  // this is the function invoked by "authenticate()" sequence action
  action(request: Request) {
    const adapter = new StrategyAdapter(this.strategy);
    const user = await adapter.authenticate(request);
    return user;
  }
}
```

Dependency Injection makes the code easier to extend and customize, because the
dependencies can be easily rewired by the application developer. It makes the
code easier to test in isolation (in a pure unit test), because the test can
inject a custom version of the dependency (a mock or a stub). This is especially
important when testing code interacting with external services like a database
or an OAuth2 provider. Instead of making expensive network requests, the test
can provide a lightweight implementation returning pre-defined responses.

## Configure what to inject

Now that we write a class that gets the dependencies injected, you are probably
wondering where are these values going to be injected from and how to configure
what should be injected. This part is typically handled by an IoC Container,
where IoC means
[Inversion of Control](https://en.wikipedia.org/wiki/Inversion_of_control).

In LoopBack, we use [Context](Context.md) to keep track of all injectable
dependencies.

There are several different ways for configuring the values to inject, the
simplest options is to call `app.bind(key).to(value)`. Building on top of the
example above, one can configure the app to use a Basic HTTP authentication
strategy as follows:

```ts
// TypeScript example

import {BasicStrategy} from 'passport-http';
import {RestApplication, RestServer} from '@loopback/rest';
// basic scaffolding stuff happens in between...

// The REST server has its own context!
const server = await app.getServer(RestServer);
server.bind(AuthenticationBindings.STRATEGY).to(new BasicStrategy(loginUser));

function loginUser(username, password, cb) {
  // check that username + password are valid
}
```

However, when you want to create a binding that will instantiate a class and
automatically inject required dependencies, then you need to use `.toClass()`
method:

```ts
server
  .bind(AuthenticationBindings.AUTH_ACTION)
  .toClass(AuthenticateActionProvider);

const provider = await server.get(AuthenticationBindings.AUTH_ACTION);
// provider is an AuthenticateActionProvider instance
// provider.strategy was set to the value returned
// by server.get('authentication.strategy')
```

When a binding is created via `.toClass()`, [Context](Context.md) will create a
new instance of the class when resolving the value of this binding, injecting
constructor arguments and property values as configured via `@inject` decorator.

Note that the dependencies to be injected could be classes themselves, in which
case [Context](Context.md) will recursively instantiate these classes first,
resolving their dependencies as needed.

In this particular example, the class is a
[Provider](Writing-Components#providers). Providers allow you to customize the
way how a value is created by the Context, possibly depending on other Context
values. A provider is typically bound using `.toProvider()` API:

```js
app
  .bind(AuthenticationBindings.AUTH_ACTION)
  .toProvider(AuthenticateActionProvider);

const authenticate = await app.get(AuthenticationBindings.AUTH_ACTION);
// authenticate is the function returned by provider's value() method
```

You can learn more about Providers in
[Creating Components](Creating-components.md).

## Flavors of Dependency Injection

LoopBack supports three kinds of dependency injection:

1.  constructor injection: the dependencies are provided as arguments of the
    class constructor.
2.  property injection: the dependencies are stored in instance properties after
    the class was constructed.
3.  method injection: the dependencies are provided as arguments of a method
    invocation. Please note that constructor injection is a special form of
    method injection to instantiate a class by calling its constructor.

### Constructor injection

This is the most common flavor that should be your default choice.

```js
class ProductController {
  constructor(@inject('repositories.Product') repo) {
    this.repo = repo;
  }

  async list() {
    return await this.repo.find({where: {available: true}});
  }
}
```

### Property injection

Property injection is usually used for optional dependencies which are not
required for the class to function or for dependencies that have a reasonable
default.

```ts
class InfoController {
  @inject('logger', {optional: true})
  private logger = ConsoleLogger();

  status() {
    this.logger.info('Status endpoint accessed.');
    return {pid: process.pid};
  }
}
```

### Method injection

Method injection allows injection of dependencies at method invocation level.
The parameters are decorated with `@inject` or other variants to declare
dependencies as method arguments.

```ts
class InfoController {
  greet(@inject(AuthenticationBindings.CURRENT_USER) user: UserProfile) {
    return `Hello, ${user.name}`;
  }
}
```

## Optional dependencies

Sometimes the dependencies are optional. For example, the logging level for a
Logger provider can have a default value if it is not set (bound to the
context).

To resolve an optional dependency, set `optional` flag to true:

```ts
const ctx = new Context();
await ctx.get('optional-key', {optional: true});
// returns `undefined` instead of throwing an error
```

Here is another example showing optional dependency injection using properties
with default values:

```ts
// Optional property injection
export class LoggerProvider implements Provider<Logger> {
  // Log writer is an optional dependency and it falls back to `logToConsole`
  @inject('log.writer', {optional: true})
  private logWriter: LogWriterFn = logToConsole;

  // Log level is an optional dependency with a default value `WARN`
  @inject('log.level', {optional: true})
  private logLevel: string = 'WARN';
}
```

Optional dependencies can also be used with constructor and method injections.

An example showing optional constructor injection in action:

```ts
export class LoggerProvider implements Provider<Logger> {
  constructor(
    // Log writer is an optional dependency and it falls back to `logToConsole`
    @inject('log.writer', {optional: true})
    private logWriter: LogWriterFn = logToConsole,
    // Log level is an optional dependency with a default value `WARN`
    @inject('log.level', {optional: true}) private logLevel: string = 'WARN',
  ) {}
}
```

An example of optional method injection, where the `prefix` argument is
optional:

```ts
export class MyController {
  greet(@inject('hello.prefix', {optional: true}) prefix: string = 'Hello') {
    return `${prefix}, world!`;
  }
}
```

## Additional `inject.*` decorators

There are a few special decorators from the `inject` namespace.

- [`@inject.getter`](Decorators_inject.md#@inject.getter)
- [`@inject.setter`](Decorators_inject.md#@inject.setter)
- [`@inject.context`](Decorators_inject.md#@inject.context)
- [`@inject.tag`](Decorators_inject.md#@inject.tag)
- [`@inject.view`](Decorators_inject.md#@inject.view)

See [Inject decorators](Decorators_inject.md) for more details.

## Circular dependencies

LoopBack can detect circular dependencies and report the path which leads to the
problem.

Consider the following example:

```ts
import {Context, inject} from '@loopback/context';

interface Developer {
  // Each developer belongs to a team
  team: Team;
}

interface Team {
  // Each team works on a project
  project: Project;
}

interface Project {
  // Each project has a lead developer
  lead: Developer;
}

class DeveloperImpl implements Developer {
  constructor(@inject('team') public team: Team) {}
}

class TeamImpl implements Team {
  constructor(@inject('project') public project: Project) {}
}

class ProjectImpl implements Project {
  constructor(@inject('lead') public lead: Developer) {}
}

const context = new Context();

context.bind('lead').toClass(DeveloperImpl);
context.bind('team').toClass(TeamImpl);
context.bind('project').toClass(ProjectImpl);

try {
  // The following call will fail
  context.getSync('lead');
} catch (e) {
  console.error(e.toString());
}
```

When the user attempts to resolve "lead" binding, LoopBack detects a circular
dependency and prints the following error:

```text
Error: Circular dependency detected:
  lead --> @DeveloperImpl.constructor[0] -->
  team --> @TeamImpl.constructor[0] -->
  project --> @ProjectImpl.constructor[0] -->
  lead
```

## Additional resources

- [Dependency Injection](https://en.wikipedia.org/wiki/Dependency_injection) on
  Wikipedia
- [Dependency Inversion Principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle)
  on Wikipedia
