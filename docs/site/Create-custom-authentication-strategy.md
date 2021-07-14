---
lang: en
title: 'Implement your own authentication strategy'
keywords: LoopBack 4.0, LoopBack 4, Authentication
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Implement-your-own-strategy.html
---

In page [Authentication component](Loopback-component-authentication.md), we
introduced "authentication strategy" as the system's core concept which contains
the logic of identity verification. And a prototype JWT strategy is provided in
the [JWT extension](JWT-authentication-extension.md) for users to try and get
started quickly.

In a real world application, the identity verification could be complicated and
production based, and the flexibility of having multiple strategies is required.
This section explains how to create and provide your own authentication
strategies.

## Create a Custom Strategy

Support for multiple authentication strategies is possible with a **common**
authentication strategy interface, and an **extensionPoint/extensions** pattern
used to **register** and **discover** authentication strategies.

The `AuthenticationComponent` declares a common authentication strategy
interface named `AuthenticationStrategy`.

```ts
export interface AuthenticationStrategy {
  /**
   * The 'name' property is a unique identifier for the
   * authentication strategy (for example: 'basic', 'jwt', etc)
   */
  name: string;

  /**
   * The 'authenticate' method takes in a given request and returns a user profile
   * which is an instance of 'UserProfile'.
   * (A user profile is a minimal subset of a user object)
   * If the user credentials are valid, this method should return a 'UserProfile' instance.
   * If the user credentials are invalid, this method should throw an error
   * If the user credentials are missing, this method should throw an error, or return 'undefined'
   * and let the authentication action deal with it.
   *
   * @param request - Express request object
   */
  authenticate(request: Request): Promise<UserProfile | undefined>;
}
```

Developers who wish to create a custom authentication strategy must implement
this interface. The custom authentication strategy must have a **unique** `name`
and have an `authenticate` function which takes in a request and returns the
user profile of an authenticated user.

Here is an example of a basic authentication strategy
`BasicAuthenticationStrategy` with the **name** `'basic'` in
`basic-strategy.ts`:

```ts
export interface Credentials {
  username: string;
  password: string;
}

export class BasicAuthenticationStrategy implements AuthenticationStrategy {
  name: string = 'basic';

  constructor(
    @inject(UserServiceBindings.USER_SERVICE)
    private userService: UserService,
  ) {}

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    const credentials: Credentials = this.extractCredentials(request);
    const user = await this.userService.verifyCredentials(credentials);
    const userProfile = this.userService.convertToUserProfile(user);

    return userProfile;
  }

  extractCredentials(request: Request): Credentials {
    let creds: Credentials;

    /**
     * Code to extract the 'basic' user credentials from the Authorization header
     */

    return creds;
  }
}
```

As you can see in the example, an authentication strategy can inject custom
services to help it accomplish certain tasks. See the complete examples for
[basic authentication strategy](https://github.com/loopbackio/loopback-next/blob/master/packages/authentication/src/__tests__/fixtures/strategies/basic-strategy.ts)
and
[jwt authentication strategy](https://github.com/loopbackio/loopback-next/blob/master/packages/authentication/src/__tests__/fixtures/strategies/jwt-strategy.ts).

The `AuthenticationComponent` component also provides two **optional** service
interfaces which may be of use to your application:
[UserService](https://github.com/loopbackio/loopback-next/blob/master/packages/authentication/src/services/user.service.ts)
and
[TokenService](https://github.com/loopbackio/loopback-next/blob/master/packages/authentication/src/services/token.service.ts).

## Registering a Custom Authentication Strategy

The **registration** and **discovery** of authentication strategies is possible
via the [Extension Point and Extensions](Extension-point-and-extensions.md)
pattern.

You don't have to worry about the **discovery** of authentication strategies,
this is taken care of by `AuthenticationStrategyProvider` which resolves and
returns an authentication strategy of type `AuthenticationStrategy`.

The `AuthenticationStrategyProvider` class **(shown below)** declares an
`extension point` named
`AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME` via the
`@extensionPoint` decorator. The binding scope is set to **transient** because
an authentication strategy **may** differ with each request.

With the aid of **metadata** of type `AuthenticationMetadata` (provided by
`AuthMetadataProvider` and injected via the `AuthenticationBindings.METADATA`
binding key), the **name** of the authentication strategy, specified in the
`@authenticate` decorator for this request, is obtained.

Then, with the aid of the `@extensions()` **getter** decorator,
`AuthenticationStrategyProvider` is responsible for **finding** and
**returning** the authentication strategy which has that specific **name** and
has been `registered` as an **extension** of the aforementioned **extension
point**.

```ts
@extensionPoint(
  AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
  {scope: BindingScope.TRANSIENT},
) //this needs to be transient, e.g. for request level context.
export class AuthenticationStrategyProvider
  implements Provider<AuthenticationStrategy | undefined>
{
  constructor(
    @extensions()
    private authenticationStrategies: Getter<AuthenticationStrategy[]>,
    @inject(AuthenticationBindings.METADATA)
    private metadata?: AuthenticationMetadata,
  ) {}
  async value(): Promise<AuthenticationStrategy | undefined> {
    if (!this.metadata) {
      return undefined;
    }
    const name = this.metadata.strategy;
    const strategy = await this.findAuthenticationStrategy(name);
    if (!strategy) {
      // important to throw a non-protocol-specific error here
      let error = new Error(`The strategy '${name}' is not available.`);
      Object.assign(error, {
        code: AUTHENTICATION_STRATEGY_NOT_FOUND,
      });
      throw error;
    }
    return strategy;
  }

  async findAuthenticationStrategy(name: string) {
    const strategies = await this.authenticationStrategies();
    const matchingAuthStrategy = strategies.find(a => a.name === name);
    return matchingAuthStrategy;
  }
}
```

In order for your custom authentication strategy to be **found**, it needs to be
**registered**.

**Registering** a custom authentication strategy `BasicAuthenticationStrategy`
as an extension of the
`AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME` extension
point in an application `application.ts` is as simple as:

```ts
import {registerAuthenticationStrategy} from '@loopback/authentication';

export class MyApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options?: ApplicationConfig) {
    super(options);

    //...

    registerAuthenticationStrategy(this, BasicAuthenticationStrategy);

    //...
  }
}
```

### Using Passport-based Strategies

The earlier version of `@loopback/authentication` is based on an express
middleware called `passport`, which supports 500+ passport strategies for
verifying an express app's requests. In `@loopback/authentication@2.0`, we
defined our own interface `AuthenticationStrategy` that describes a strategy
with different contracts than the passport strategy, but we still want to keep
the ability to support those existing 500+ community passport strategies.
Therefore, we rewrote the adapter class. It now converts a passport strategy to
the one that LoopBack 4 authentication system expects and it was released in a
new package `@loopback/authentication-passport`.

Creating and registering a passport strategy is explained in
[the README.md file](https://www.npmjs.com/package/@loopback/authentication-passport)

The usage of authentication decorator and the change in sequence stay the same.
