# @loopback/authentication

A LoopBack component for authentication support.

**This is a reference implementation showing how to implement an authentication component, it is not production ready.**

## Overview

The component demonstrates how to leverage Passport module and extension points
provided by LoopBack Next to implement an authentication layer.

## Installation

```shell
npm install --save @loopback/authentication
```

## Basic use

Start by decorating your controller methods with `@authenticate` to require
the request to be authenticated.

```ts
// controllers/my-controller.ts
import {UserProfile, authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {get} from '@loopback/rest';

export class MyController {
  constructor(@inject(AuthenticationBindings.CURRENT_USER) private user: UserProfile) {}

  @authenticate('BasicStrategy')
  @get('/whoAmI')
  whoAmI() {
    return this.user.id;
  }
}
```

Next, implement a Strategy provider to map strategy names specified
in `@authenticate` decorators into Passport Strategy instances.
Remember to install `passport`, `passport-http`, `@types/passport`, and
`@types/passport-http` modules beforehand.

```ts
// providers/auth-strategy.ts
import {
  inject,
  Provider,
  ValueOrPromise,
} from '@loopback/context';
import {
  AuthenticationBindings,
  AuthenticationMetadata,
} from '@loopback/authentication';

import {Strategy} from 'passport';
import {BasicStrategy} from 'passport-http';

export class MyAuthStrategyProvider implements Provider<Strategy | undefined> {
  constructor(
    @inject(AuthenticationBindings.METADATA)
    private metadata: AuthenticationMetadata,
  ) {}

  value() : ValueOrPromise<Strategy | undefined> {

    // The function was not decorated, so we shouldn't attempt authentication
    if (!this.metadata) {
      return undefined;
    }

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
  inject,
} from '@loopback/core';

import {
  FindRoute,
  InvokeMethod,
  ParsedRequest,
  ParseParams,
  Reject,
  Send,
  ServerResponse,
  SequenceHandler,
  RestBindings,
} from '@loopback/rest';

import {
  AuthenticateFn,
  AuthenticationBindings,
} from '@loopback/authentication';

const SequenceActions = RestBindings.SequenceActions;

export class MySequence implements SequenceHandler {
  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) protected send: Send,
    @inject(SequenceActions.REJECT) protected reject: Reject,
    @inject(AuthenticationBindings.AUTH_ACTION)
    protected authenticateRequest: AuthenticateFn,
  ) {}

  async handle(req: ParsedRequest, res: ServerResponse) {
    try {
      const route = this.findRoute(req);

      // This is the important line added to the default sequence implementation
      await this.authenticateRequest(req);

      const args = await this.parseParams(req, route);
      const result = await this.invoke(route, args);
      this.send(res, result);
    } catch (err) {
      this.reject(res, req, err);
    }
  }
}
```

Finally, put it all together in your application class:

```ts
import {Application} from '@loopback/core';
import {
  AuthenticationComponent,
  AuthenticationBindings,
} from '@loopback/authentication';
import {RestComponent, RestServer} from '@loopback/rest';
import {MyAuthStrategyProvider} from './providers/auth-strategy';
import {MyController} from './controllers/my-controller';
import {MySequence} from './sequence';

class MyApp extends RestApplication {
  constructor() {
    super({
      components: [AuthenticationComponent],
      rest: {
        sequence: MySequence
      },
      controllers: [MyController],
    });

    this
      .bind(AuthenticationBindings.STRATEGY)
      .toProvider(MyAuthStrategyProvider);

    this.controller(MyController);
  }

  async start() {
    await super.start();

    const server = await this.getServer(RestServer);
    console.log(`REST server running on port: ${server.getSync('rest.port')}`);
  }
}
```

You can try your authentication component by using your favourite REST client
and by setting the `authorization` header. Here is an example of what your
request might look like using curl:
```
curl -X GET \
  http://localhost:3000/whoami \
  -H 'authorization: Basic Zm9vOmJhcg=='
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
