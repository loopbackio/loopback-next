# @loopback/authentication

A LoopBack component for authentication support.

**This is a reference implementation showing how to implement an authentication component, it is not production ready.**

## Overview

The component demonstrates how to leverage Passport module and extension points
provided by LoopBack Next to implement authentication layer.

## Installation

```shell
npm install --save @loopback/authentication
```

## Basic use

Start by decorating your controller methods with `@authenticate` to require
the request to be authenticated.

```ts
// controllers/my-controller.ts
import {UserProfile, authenticate} from '@loopback/authentication';

class MyController {
  constructor(@inject('authentication.user') private user: UserProfile) {}

  @authenticate('BasicStrategy')
  whoAmI() {
    return this.user.id;
  }
}
```

Next, implement a Strategy provider to map strategy names specified
in `@authenticate` decorators into Passport Strategy instances.

```ts
// providers/auth-strategy.ts
import {
  inject,
  Provider,
  ValueOrPromise,
} from '@loopback/context';
import {
  BindingKeys,
  AuthenticationMetadata,
} from '@loopback/authentication';

import {Strategy} from 'passport';
import {BasicStrategy} from 'passport-http';

export class MyAuthStrategyProvider implements Provider<Strategy> {
  constructor(
    @inject(BindingKeys.Authentication.METADATA)
    private metadata: AuthenticationMetadata,
  ) {}

  value() : ValueOrPromise<Strategy> {
    const name = this.metadata.strategy;
    if (name === 'BasicStrategy') {
      return new BasicStrategy(this.verify);
    } else {
      return Promise.reject(`The strategy ${name} is not available.`);
    }
  }

  verify(username: string, password: string, cb: Function) {
    // find user by name & password
    // call cb(null, false) when user not found
    // call cb(null, userProfile) when user is authenticated
  }
}
```

In order to perform authentication, we need to implement a custom Sequence
invoking the authentication at the right time during the request handling.

```ts
// sequence.ts
import {
  FindRoute,
  inject,
  InvokeMethod,
  ParsedRequest,
  parseOperationArgs,
  Reject,
  Send,
  ServerResponse,
  SequenceHandler,
} from '@loopback/core';

import {
  AuthenticateFn,
} from '@loopback/authentication';

export class MySequence implements SequenceHandler {
  constructor(
    @inject('sequence.actions.findRoute') protected findRoute: FindRoute,
    @inject('sequence.actions.invokeMethod') protected invoke: InvokeMethod,
    @inject('sequence.actions.send') protected send: Send,
    @inject('sequence.actions.reject') protected reject: Reject,
    @inject('authentication.actions.authenticate')
    protected authenticateRequest: AuthenticateFn,
  ) {}

  async handle(req: ParsedRequest, res: ServerResponse) {
    try {
      const route = this.findRoute(req);

      // This is the important line added to the default sequence implementation
      const user = await this.authenticateRequest(req);

      const args = await parseOperationArgs(req, route);
      const result = await this.invoke(route, args);
      this.send(res, result);
    } catch (err) {
      this.reject(res, req, err);
    }
  }
}
```

Finally, put it all together in your application object:

```ts
import {Application} from '@loopback/core';
import {AuthenticationComponent, BindingKeys} from '@loopback/authentication';
import {MyAuthStrategyProvider} from './providers/auth-strategy';
import {MyController} from './controllers/my-controller';
import {MySequence} from './sequence';

class MyApp extends Application {
  constructor() {
    super({
      components: [AuthenticationComponent],
    });

    this.bind(BindingKeys.Authentication.STRATEGY)
      .toProvider(MyAuthStrategyProvider);
    this.sequence(MySequence);

    this.controller(MyController);
  }
}
```

## Related resources

For more info about passport, see [passport.js](http://passportjs.org/).

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/wiki/Contributing#guidelines)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

run `npm test` from the root folder.

## Contributors

See [all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
