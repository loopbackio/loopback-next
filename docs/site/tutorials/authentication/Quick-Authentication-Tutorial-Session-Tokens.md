---
lang: en
title: 'Quick introduction to authentication with session tokens'
keywords: LoopBack 4.0, LoopBack 4, Authentication, Tutorial
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Quick-Authentication-Tutorial-Session-Tokens.html
summary: A LoopBack 4 application that uses session tokens for authentication
---

## Overview

Loopbck 4 authentication is explained in detail
[here](../../Loopback-component-authentication.md) and there is a complete
tutorial for authentication with JWTs [here](Authentication-Tutorial.md).

But this tutorial summarises just the very basic steps to help you get started
with simple authentication.

You can adapt the code below to suit your needs, but let's start by imagining
that we will build an OAuth2-like approach using session tokens:

1. The user will make a POST request to `/user/login` passing a **Basic**
   authentication header.

   If successful, this will return a session token to the user.

2. On all future requests, the user will present the token via a **Bearer**
   authentication header.

## Install dependencies

First, ensure you have the necessary packages installed:

```sh
npm install @loopback/authentication @loopback/security
```

## Add authentication to the sequence

Authentication is not enabled by default. We need to tell loopback that every
incoming HTTP request should check to see if authentication is required.

Open `src/sequence.ts` and add the following:

```ts
// At the top

import { AuthenticationBindings, AuthenticateFn } from '@loopback/authentication';

// In the constructor's arguments

    @inject(AuthenticationBindings.AUTH_ACTION) protected authenticateRequest: AuthenticateFn,

// In the handle function

    const route = this.findRoute(request);
    await this.authenticateRequest(request);    // ADD THIS LINE
    const args = await this.parseParams(request, route);
```

## Create a Basic authentication strategy

The AuthenticationStrategy is where the work really happens. It will extract the
authentication details from the HTTP request, and check them against the
database.

Make a new folder `src/strategies`

Create the file `src/strategies/basic-strategy.ts` with the following content:

```ts
import {AuthenticationStrategy} from '@loopback/authentication';
import {UserProfile, securityId} from '@loopback/security';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors, Request} from '@loopback/rest';
import {UserRepository} from '../repositories';

export interface Credentials {
  clientKey: string;
  clientSecret: string;
}

export class BasicAuthenticationStrategy implements AuthenticationStrategy {
  name = 'BasicStrategy';

  constructor() {}
  //@repository(UserRepository) public userRepository: UserRepository,

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    const credentials: Credentials = this.extractCredentials(request);

    // Initial mock implementation
    // TODO Replace this with your own implementation
    if (
      credentials.clientKey === 'testuser' &&
      credentials.clientSecret === 'password123'
    ) {
      return {name: 'testuser', [securityId]: 'abc123'};
    } else {
      throw new HttpErrors.Unauthorized('The credentials are not correct.');
    }

    // You should implement your own checks here
    // 1. Find the user in your database
    // 2. Ensure credentials.clientSecret matches the user's hashed password
    // 3. Return the user if authenticated
    //    Otherwise return an error (cancel the request),
    //    or return undefined (let your controllers handle the missing user)

    // Here is a more complete example you could start from
    /*
    const foundUser = await this.userRepository.findOne({
      where: {username: credentials.clientKey},
      // or alternatively
      where: {email: credentials.clientKey},
    });

    if (!foundUser) {
      throw new HttpErrors.NotFound(
        `User with clientKey ${credentials.clientKey} not found.`,
      );
    }

    // Using the password hasher from https://bit.ly/34q3IJp
    const passwordMatched = await this.passwordHasher.comparePassword(
      credentials.clientSecret,
      foundUser.password,
    );

    if (passwordMatched) {
      // We must at least return a UserProfile with a securityId
      return {email: foundUser.email, [securityId]: foundUser.id};
      // Or we can return the full User object, with the securityId added to it
      // This will give the controllers more user properties to play with
      foundUser[securityId] = foundUser.id;
      return foundUser;
    } else {
      throw new HttpErrors.Unauthorized('The credentials are not correct.');
    }
    */
  }

  extractCredentials(request: Request): Credentials {
    if (!request.headers.authorization) {
      throw new HttpErrors.Unauthorized(`Authorization header not found.`);
    }

    // For example: 'Basic ' + base64encoded('username:password')
    //          or: 'Basic ' + base64encoded('email@address.com:secret')
    const authHeaderValue = request.headers.authorization;

    const headerParts = authHeaderValue.split(' ');
    if (headerParts[0] !== 'Basic') {
      throw new HttpErrors.Unauthorized(
        `Authorization header is not of type 'Basic'.`,
      );
    }
    if (headerParts.length !== 2) {
      throw new HttpErrors.Unauthorized(
        `Authorization header should follow 'Basic' with a single base64 encoded string`,
      );
    }

    const encodedAuth = headerParts[1];
    const decodedAuth = new Buffer(encodedAuth, 'base64').toString('utf8');

    const authParts = decodedAuth.split(':');
    if (authParts.length !== 2) {
      throw new HttpErrors.Unauthorized(
        `Authorization header's decoded value should have exactly two parts, separated by a ':'`,
      );
    }

    return {clientKey: authParts[0], clientSecret: authParts[1]};
  }
}
```

## Register the Basic authentication strategy

Now we need to tell our application that this strategy exists and can be used.

Open `src/application.ts` and add the following lines:

```ts
import {
  AuthenticationComponent,
  registerAuthenticationStrategy,
} from '@loopback/authentication';
import {BasicAuthenticationStrategy} from './strategies/basic-strategy';

// At the bottom of the constructor function

this.component(AuthenticationComponent);
registerAuthenticationStrategy(this, BasicAuthenticationStrategy);
```

## Start using the Basic authentication strategy in controllers

To employ our authentication in controllers, we can use the `@authenticate()`
decorator.

For OAuth2 you may want to create a `/users/login` route. You could add it to
your existing UserController (or to the PingController, if that is all you have
right now).

Add the following lines to your controller:

```ts
import { authenticate, AuthenticationBindings } from '@loopback/authentication';
import { UserProfile } from '@loopback/security';

// In the constructor's arguments

    @inject(AuthenticationBindings.CURRENT_USER, { optional: true }) private user: UserProfile,
    // If you decided earlier to pass the full User object to controllers, put `UserProfile & User`

// Add the API endpoint

  @authenticate('BasicStrategy')
  @post('/users/login')
  async login(): Promise<{token: string}> {
    // We expect the Basic strategy will have authenticated a user.
    // In fact if your strategy uses `throw Error` instead of `return undefined`
    // then we can skip this check!
    if (this.user) {
      console.log("/users/login has received user:", this.user);
      // TODO Generate a unique bearer token for this user and store it in the DB
      const token = 'example_token_999';
      return {token};
    } else {
      throw new Error('User was not authenticated');
    }
  }
```

## Add a test to ensure it works as expected

Add the following to one of your acceptance tests:

```ts
it('can log in with POST /users/login', async () => {
  const plainAuth = 'testuser:password123';
  const encodedAuth = Buffer.from(plainAuth).toString('base64');
  const res = await client
    .post('/users/login')
    .set('Authorization', 'Basic ' + encodedAuth)
    .expect(200);
  expect(res.body).to.containEql({token: 'example_token_999'});
});
```

Now running `npm test` will verify that your authentication pipeline works.

## Next steps

Now you have seen how to integrate with Loopback's authentication framework.

From here you can adapt the strategy to meet your requirements. For example,
you could communicate with an existing service or database for authentication.

Alternatively, if you want to build a complete authentication system from
scratch, you could follow the [JSON WebTokens
tutorial](Authentication-Tutorial.md).

Or if you want to complete the session token based system, read on.

## Completing the session tokens system

There is still some work to be done to finish the system we started building.

The strategy we added above requires sending the username and password on every
request. But our goal is to let the user authenticate future requests by
presenting a short lived token. We have not issued any token to the user yet.

To complete your session token authentication system you could:

- Update the BasicAuthenticationStrategy to use real DB data (consulting the
  User and perhaps Password repositories).

- Add a new AuthToken model and repository, which will map session tokens to
  user accounts. Tokens should have an expiry time.

- Update the `/users/login` endpoint to generate a token dynamically and store
  it in the DB, before returning it to the user.

- Create a new BearerAuthenticationStrategy, similar to the
  BasicAuthenticationStrategy we made earlier, except instead of checking the
  provided clientKey and clientSecret, this one will look up the provided token.

- Register the BearerAuthenticationStrategy in `application.ts` (as we did for
  the BasicAuthenticationStrategy).

- Use `@authenticate('BasicStrategy')` only for the login endpoint.

  Use `@authenticate('BearerStrategy')` for all other endpoints where the user
  must be known.

- Write a test to ensure that we can authenticate with with a generated token.

  In this case clients will pass the token like this:

  ```ts
  const encodedAuth = Buffer.from(sessionToken).toString('base64'); // different
  const res = await client
    .get('/users/_self/private_data')              // different
    .set('Authorization', 'Bearer ' + encodedAuth) // different
    .expect(200);
  ```

## Example code

You can see an example of the steps in this tutorial as commits in
[this repository](https://github.com/joeytwiddle/lb-4-authentication-session-tokens-example/commits/first-steps).
