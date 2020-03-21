# Passport Strategy Adapter

_Important: We strongly recommend that users learn LoopBack's
[authentication system](https://loopback.io/doc/en/lb4/Loopback-component-authentication.html)
before using this module._

This is an adapter module created for plugging in
[`passport`](https://www.npmjs.com/package/passport) based strategies to the
authentication system in `@loopback/authentication@3.x`.

## Installation

```sh
npm i @loopback/authentication-passport --save
```

## Background

`@loopback/authentication@3.x` allows users to register authentication
strategies that implement the interface
[`AuthenticationStrategy`](https://apidocs.strongloop.com/@loopback%2fdocs/authentication.html#AuthenticationStrategy)

Since `AuthenticationStrategy` describes a strategy with different contracts
than the passport
[`Strategy`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/passport/index.d.ts#L79),
and we'd like to support the existing 500+ community passport strategies, an
**adapter class** is created in this package to convert a passport strategy to
the one that LoopBack 4 authentication system wants.

## Usage

For the examples that follow, we will be using `passport-http`, so be sure to
install these modules:

```
npm i passport-http @types/passport-http --save
```

### Simple Usage

1. Create an instance of the passport strategy

Taking the basic strategy exported from
[`passport-http`](https://github.com/jaredhanson/passport-http) as an example,
first create an instance of the basic strategy with your `verify` function.

```ts
// Create a file named `my-basic-auth-strategy.ts` to define your strategy below

import {BasicStrategy} from 'passport-http';

function verify(username: string, password: string, cb: Function) {
  users.find(username, password, cb);
}
const basicStrategy = new BasicStrategy(verify);
```

It's a similar configuration as you add a strategy to a `passport` by calling
`passport.use()`.

2. Supply a _user profile factory_ which converts a user to a user profile. It
   must abide by the `UserProfileFactory` interface supplied by
   `@loopback/authentication@3.x`.

It is shown below for your convenience.

```ts
export interface UserProfileFactory<U> {
  (user: U): UserProfile;
}
```

A default user profile factory is provided for you in the StrategyAdapter
constructor, but it does very little. It simply returns the user model as-is.

```ts
private userProfileFactory: UserProfileFactory<U> = (u: unknown) => {
      return u as UserProfile;
},
```

So it is recommended you provide a more meaningful mapping.

An example of a user profile factory converting a specific user type `MyUser` to
type `UserProfile` is shown below.

```ts
//In file 'my.userprofile.factory.ts'

import {UserProfileFactory} from '@loopback/authentication';
import {securityId, UserProfile} from '@loopback/security';

export const myUserProfileFactory: UserProfileFactory<MyUser> = function (user: MyUser): UserProfile {
    const userProfile = {[securityId]: user.id};
    return userProfile;
    }
}
```

3. Apply the adapter to the strategy

```ts
// In file 'my-basic-auth-strategy.ts'
import {BasicStrategy} from 'passport-http';
import {UserProfileFactory} from '@loopback/authentication';
import {securityId, UserProfile} from '@loopback/security';
import {myUserProfileFactory} from '<path to user profile factory>';

function verify(username: string, password: string, cb: Function) {
  users.find(username, password, cb);
}
const basicStrategy = new BasicStrategy(verify);

// Apply the adapter
export const AUTH_STRATEGY_NAME = 'basic';
export const basicAuthStrategy = new StrategyAdapter(
  // The configured basic strategy instance
  basicStrategy,
  // Give the strategy a name
  // You'd better define your strategy name as a constant, like
  // `const AUTH_STRATEGY_NAME = 'basic'`.
  // You will need to decorate the APIs later with the same name.
  AUTH_STRATEGY_NAME,
  // Provide a user profile factory
  myUserProfileFactory,
);
```

4. Register(bind) the strategy to app

```ts
import {Application, CoreTags} from '@loopback/core';
import {AuthenticationBindings} from '@loopback/authentication';
import {basicAuthStrategy} from './my-basic-auth-strategy';

app
  .bind('authentication.strategies.basicAuthStrategy')
  .to(basicAuthStrategy)
  .tag({
    [CoreTags.EXTENSION_FOR]:
      AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
  });
```

5. Decorate your endpoint

To authenticate your request with the basic strategy, decorate your controller
function like:

```ts
import {AUTH_STRATEGY_NAME} from './my-basic-auth-strategy';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {authenticate} from '@loopback/authentication';

class MyController {
  constructor(
    @inject(SecurityBindings.USER, {optional: true})
    private user: UserProfile,
  ) {}

  // Define your strategy name as a constant so that
  // it is consistent with the name you provide in the adapter
  @authenticate(AUTH_STRATEGY_NAME)
  async whoAmI(): Promise<string> {
    return this.user.id;
  }
}
```

6. Add the authentication action to your sequence

This part is same as registering a non-passport based strategy. Please make sure
you follow the documentation
[adding-an-authentication-action-to-a-custom-sequence](https://loopback.io/doc/en/lb4/Loopback-component-authentication.html#adding-an-authentication-action-to-a-custom-sequence)
to rewrite your sequence. You can also find a sample implementation in
[this example tutorial](https://loopback.io/doc/en/lb4/Authentication-Tutorial.html#creating-a-custom-sequence-and-adding-the-authentication-action).

### With Provider

If you need to inject stuff (e.g. the verify function, user profile factory
function) when configuring the strategy, you may want to provide your strategy
as a provider.

_Note: If you are not familiar with LoopBack providers, check the documentation
in
[Extending LoopBack 4](https://loopback.io/doc/en/lb4/Extending-LoopBack-4.html)_

1. Create a provider for the strategy

Use `passport-http` as the example again:

```ts
// Create a file named `my-basic-auth-strategy.ts` to define your strategy below

import {AuthenticationStrategy} from '@loopback/authentication';
import {Provider} from '@loopback/core';

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
// In file 'providers/my-basic-auth-strategy.ts'

import {BasicStrategy, BasicVerifyFunction} from 'passport-http';
import {StrategyAdapter} from `@loopback/passport-adapter`;
import {
  AuthenticationStrategy,
  AuthenticationBindings,
} from '@loopback/authentication';
import {Provider} from '@loopback/core';
import {inject} from '@loopback/context';

export class PassportBasicAuthProvider<MyUser>
  implements Provider<AuthenticationStrategy> {
  constructor(
    @inject('authentication.basic.verify')
    private verifyFn: BasicVerifyFunction,
    @inject(AuthenticationBindings.USER_PROFILE_FACTORY)
    private myUserProfileFactory: UserProfileFactory<MyUser>,
  ) {}

  value(): AuthenticationStrategy {
    const basicStrategy = this.configuredBasicStrategy(this.verifyFn);
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
  // Pass in the user profile factory
  convertToAuthStrategy(basic: BasicStrategy): AuthenticationStrategy {
    return new StrategyAdapter(
      basic,
      AUTH_STRATEGY_NAME,
      this.myUserProfileFactory,
    );
  }
}
```

2. Create a provider for the verify function.

Here is an example provider named VerifyFunctionProvider which has a `value()`
method that returns a function of type BasicVerifyFunction.

```ts
// In file 'providers/verifyfn.provider.ts'

import {Provider} from '@loopback/core';
import {repository} from '@loopback/repository';
import {BasicVerifyFunction} from 'passport-http';
import {INVALID_USER_CREDENTIALS_MESSAGE} from '../keys';

export class VerifyFunctionProvider implements Provider<BasicVerifyFunction> {
  constructor(@repository('users') private userRepo: MyUserRepository) {}

  value(): BasicVerifyFunction {
    const myThis = this;

    return async function (username: string, password: string, cb: Function) {
      let user: MyUser;

      try {
        //find user with specific username
        const users: MyUser[] = await myThis.userRepo.find({
          where: {username: username},
        });

        // if no user found with this username, throw an error.
        if (users.length < 1) {
          let error = new Error(INVALID_USER_CREDENTIALS_MESSAGE); //assign 401 in sequence
          throw error;
        }

        //verify given password matches the user's password
        user = users[0];
        if (user.password !== password) {
          let error = new Error(INVALID_USER_CREDENTIALS_MESSAGE); //assign 401 in sequence
          throw error;
        }

        //return null for error, and the valid user
        cb(null, user);
      } catch (error) {
        //return the error, and null for the user
        cb(error, null);
      }
    };
  }
}
```

3. Register(bind) the providers

Register **VerifyFunctionProvider** which is required by
**PassportBasicAuthProvider**. Then register **PassportBasicAuthProvider** in
your LoopBack application so that the authentication system can look for your
strategy by name and invoke it.

```ts
// In the main file

import {addExtension} from '@loopback/core';
import {MyApplication} from '<path_to_your_app>';
import {PassportBasicAuthProvider} from '<path_to_the_provider>';
import {VerifyFunctionProvider} from '<path_to_the_provider>';
import {
  AuthenticationBindings,
  AuthenticationComponent,
} from '@loopback/authentication';

const app = new MyApplication();

//load the authentication component
app.component(AuthenticationComponent);

// bind the user repo
app.bind('repositories.users').toClass(MyUserRepository);

// bind the authenticated sequence (mentioned later in this document)
app.sequence(MyAuthenticationSequence);

// the verify function for passport-http
app.bind('authentication.basic.verify').toProvider(VerifyFunctionProvider);

// register PassportBasicAuthProvider as a custom authentication strategy
addExtension(
  app,
  AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
  PassportBasicAuthProvider,
  {
    namespace:
      AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
  },
);
```

4. Decorate your endpoint

To authenticate your request with the basic strategy, decorate your controller
function like:

```ts
import {AUTH_STRATEGY_NAME} from './my-basic-auth-strategy';
import {authenticate} from '@loopback/authentication';

class MyController {
  constructor(@inject(SecurityBindings.USER) private user: UserProfile) {}

  // Define your strategy name as a constant so that
  // it is consistent with the name you provide in the adapter
  @authenticate(AUTH_STRATEGY_NAME)
  async whoAmI(): Promise<string> {
    return this.user.id;
  }
}
```

5. Add the authentication action to your sequence

This part is same as registering a non-passport based strategy. Please make sure
you follow the documentation
[adding-an-authentication-action-to-a-custom-sequence](https://loopback.io/doc/en/lb4/Loopback-component-authentication.html#adding-an-authentication-action-to-a-custom-sequence)
to rewrite your sequence. You can also find a sample implementation in
[this example tutorial](https://loopback.io/doc/en/lb4/Authentication-Tutorial.html#creating-a-custom-sequence-and-adding-the-authentication-action).
