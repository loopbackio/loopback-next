# @loopback/authentication

A LoopBack 4 component for authentication support.

**This is a reference implementation showing how to implement an authentication
component, it is not production ready.**

## Overview

The component demonstrates how to leverage Passport module and extension points
provided by LoopBack 4 to implement an authentication layer.

To handle multiple authentication strategies without using the Passport module,
please read
[Multiple Authentication strategies](./packages/authentication/docs/authentication-system.md).

## Installation

```shell
npm install --save @loopback/authentication
```

## Basic use

Start by decorating your controller methods with `@authenticate` to require the
request to be authenticated.

In this example, we make the user profile available via dependency injection
using a key available from `@loopback/authentication` package.

```ts
// src/controllers/who-am-i.controller.ts
import {inject} from '@loopback/context';
import {
  AuthenticationBindings,
  UserProfile,
  authenticate,
} from '@loopback/authentication';
import {get} from '@loopback/rest';

export class WhoAmIController {
  constructor(
    @inject(AuthenticationBindings.CURRENT_USER) private user: UserProfile,
  ) {}

  @authenticate('BasicStrategy')
  @get('/whoami')
  whoAmI(): string {
    return this.user.id;
  }
}
```

Next, implement a Strategy provider to map strategy names specified in
`@authenticate` decorators into Passport Strategy instances. Remember to install
`passport`, `passport-http`, `@types/passport`, and `@types/passport-http`
modules beforehand.

```shell
npm install --save passport passport-http
npm install --save-dev @types/passport @types/passport-http
```

```ts
// src/providers/auth-strategy.provider.ts
import {Provider, inject, ValueOrPromise} from '@loopback/context';
import {Strategy} from 'passport';
import {
  AuthenticationBindings,
  AuthenticationMetadata,
  UserProfile,
} from '@loopback/authentication';
import {BasicStrategy} from 'passport-http';

export class MyAuthStrategyProvider implements Provider<Strategy | undefined> {
  constructor(
    @inject(AuthenticationBindings.METADATA)
    private metadata: AuthenticationMetadata,
  ) {}

  value(): ValueOrPromise<Strategy | undefined> {
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

  verify(
    username: string,
    password: string,
    cb: (err: Error | null, user?: UserProfile | false) => void,
  ) {
    // find user by name & password
    // call cb(null, false) when user not found
    // call cb(null, user) when user is authenticated
  }
}
```

In order to perform authentication, we need to implement a custom Sequence
invoking the authentication at the right time during the request handling.

```ts
// src/sequence.ts
import {
  RestBindings,
  SequenceHandler,
  FindRoute,
  ParseParams,
  InvokeMethod,
  Send,
  Reject,
  RequestContext,
} from '@loopback/rest';
import {inject} from '@loopback/context';
import {AuthenticationBindings, AuthenticateFn} from '@loopback/authentication';

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

  async handle(context: RequestContext) {
    try {
      const {request, response} = context;
      const route = this.findRoute(request);

      // This is the important line added to the default sequence implementation
      await this.authenticateRequest(request);

      const args = await this.parseParams(request, route);
      const result = await this.invoke(route, args);
      this.send(response, result);
    } catch (error) {
      this.reject(context, error);
    }
  }
}
```

Finally, put it all together in your application class:

```ts
// src/application.ts
import {BootMixin, Binding, Booter} from '@loopback/boot';
import {RestApplication, RestServer, RestBindings} from '@loopback/rest';
import {
  AuthenticationComponent,
  AuthenticationBindings,
} from '@loopback/authentication';
import {MyAuthStrategyProvider} from './providers/auth-strategy.provider';
import {MySequence} from './sequence';
import {ApplicationConfig} from '@loopback/core';

export class MyApp extends BootMixin(RestApplication) {
  constructor(options?: ApplicationConfig) {
    super(options);

    this.projectRoot = __dirname;

    this.component(AuthenticationComponent);
    this.bind(AuthenticationBindings.STRATEGY).toProvider(
      MyAuthStrategyProvider,
    );

    this.sequence(MySequence);
  }

  async start() {
    await super.start();

    const server = await this.getServer(RestServer);
    const port = await server.get(RestBindings.PORT);
    console.log(`REST server running on port: ${port}`);
  }
}
```

You can try your authentication component by using your favourite REST client
and by setting the `authorization` header. Here is an example of what your
request might look like using curl:

```shell
curl -u username:password http://localhost:3000/whoami
```

or if you'd like to manually set the headers:

```shell
curl -X GET \
  http:/localhost:3000/whoami \
  -H 'Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ='
```

## Related resources

For more info about passport, see [passport.js](http://passportjs.org/).

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
