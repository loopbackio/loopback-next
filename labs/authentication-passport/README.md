# Passport Strategy Adapter

_Important: We strongly suggest that users understand LoopBack's
[authentication system](https://loopback.io/doc/en/lb4/Loopback-component-authentication.html)
before using this module_

This is an adapter module created for plugging in
[`passport`](https://www.npmjs.com/package/passport) based strategies to the
authentication system in `@loopback/authentication@2.x`.

## Installation

```sh
npm i @loopback/authentication-passport --save
```

## Background

`@loopback/authentication@2.x` allows users to register authentication
strategies that implement the interface
[`AuthenticationStrategy`](https://apidocs.strongloop.com/@loopback%2fdocs/authentication.html#AuthenticationStrategy)

Since `AuthenticationStrategy` describes a strategy with different contracts
than the passport
[`Strategy`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/passport/index.d.ts#L79),
and we'd like to support the existing 500+ community passport strategies, an
**adapter class** is created in this package to convert a passport strategy to
the one that LoopBack 4 authentication system wants.

## Usage

### Simple Usage

1. Create an instance of the passport strategy

Taking the basic strategy exported from
[`passport-http`](https://github.com/jaredhanson/passport-http) as an example,
first create an instance of the basic strategy with your `verify` function.

```ts
import {BasicStrategy} from 'passport-http';

function verify(username: string, password: string, cb: Function) {
  users.find(username, password, cb);
}
const basicStrategy = new BasicStrategy(verify);
```

It's a similar configuration as you do when adding a strategy to a `passport` by
calling `passport.use()`.

2. Apply the adapter to the strategy

```ts
const AUTH_STRATEGY_NAME = 'basic';

const basicAuthStrategy = new StrategyAdapter(
  // The configured basic strategy instance
  basicStrategy,
  // Give the strategy a name
  // You'd better define your strategy name as a constant, like
  // `const AUTH_STRATEGY_NAME = 'basic'`.
  // You will need to decorate the APIs later with the same name.
  AUTH_STRATEGY_NAME,
);
```

3. Register(bind) the strategy to app

```ts
import {Application, CoreTags} from '@loopback/core';
import {AuthenticationBindings} from '@loopback/authentication';

app
  .bind('authentication.strategies.basicAuthStrategy')
  .to(basicAuthStrategy)
  .tag({
    [CoreTags.EXTENSION_FOR]:
      AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
  });
```

### With Provider

If you need to inject stuff (e.g. the verify function) when configuring the
strategy, you may want to provide your strategy as a provider.

_Note: If you are not familiar with LoopBack providers, check the documentation
in
[Extending LoopBack 4](https://loopback.io/doc/en/lb4/Extending-LoopBack-4.html)_

1. Create a provider for the strategy

Use `passport-http` as the example again:

```ts
class PassportBasicAuthProvider implements Provider<AuthenticationStrategy> {
  value(): AuthenticationStrategy {
    // The code that returns the converted strategy
  }
}
```

The Provider should have two functions:

- A function that takes in the verify callback function and returns a configured
  basic strategy. To know more about the configuration, please check
  [the configuration guide in module `passport-http`](https://github.com/jaredhanson/passport-http#usage-of-http-basic).

- A function that applies the `StrategyAdapter` to the configured basic strategy
  instance. Then in the `value()` function, you return the converted strategy.

So a full implementation of the provider is:

```ts
import {BasicStrategy, BasicVerifyFunction} from 'passport-http';
import {StrategyAdapter} from `@loopback/passport-adapter`;
import {AuthenticationStrategy} from '@loopback/authentication';

class PassportBasicAuthProvider implements Provider<AuthenticationStrategy> {
  constructor(
    @inject('authentication.basic.verify') verifyFn: BasicVerifyFunction,
  );
  value(): AuthenticationStrategy {
    const basicStrategy = this.configuredBasicStrategy(verify);
    return this.convertToAuthStrategy(basicStrategy);
  }

  // Takes in the verify callback function and returns a configured basic strategy.
  configuredBasicStrategy(verifyFn: BasicVerifyFunction): BasicStrategy {
    return new BasicStrategy(verifyFn);
  }

  // Applies the `StrategyAdapter` to the configured basic strategy instance.
  // You'd better define your strategy name as a constant, like
  // `const AUTH_STRATEGY_NAME = 'basic'`
  // You will need to decorate the APIs later with the same name
  convertToAuthStrategy(basic: BasicStrategy): AuthenticationStrategy {
    return new StrategyAdapter(basic, AUTH_STRATEGY_NAME);
  }
}
```

2. Register the strategy provider

Register the strategy provider in your LoopBack application so that the
authentication system can look for your strategy by name and invoke it:

```ts
// In the main file

import {addExtension} from '@loopback/core';
import {MyApplication} from '<path_to_your_app>';
import {PassportBasicAuthProvider} from '<path_to_the_provider>';
import {
  AuthenticationBindings,
  registerAuthenticationStrategy,
} from '@loopback/authentication';

const app = new MyApplication();

// In a real app the function would be imported from a community module
function verify(username: string, password: string, cb: Function) {
  users.find(username, password, cb);
}

app.bind('authentication.basic.verify').to(verify);
registerAuthenticationStrategy(app, PassportBasicAuthProvider);
```

3. Decorate your endpoint

To authenticate your request with the basic strategy, decorate your controller
function like:

```ts
class MyController {
  constructor(
    @inject(AuthenticationBindings.CURRENT_USER) private user: UserProfile,
  ) {}

  // Define your strategy name as a constant so that
  // it is consistent with the name you provide in the adapter
  @authenticate(AUTH_STRATEGY_NAME)
  async whoAmI(): Promise<string> {
    return this.user.id;
  }
}
```
