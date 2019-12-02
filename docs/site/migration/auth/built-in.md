---
lang: en
title: 'Migrating built-in authentication and authorization'
keywords: LoopBack 4.0, LoopBack 4, LoopBack 3, Migration
sidebar: lb4_sidebar
permalink: /doc/en/lb4/migration-auth-built-in.html
---

## Migrate the authentication flow

### Request access tokens via login

In LoopBack 3, the built-in `User` model exposes a `login` endpoint at
`POST /Users/login`. It allows a user to be authenticated with `username/email`
and `password`. Successful login returns a JSON object that contains the `id` as
the access token. See
https://loopback.io/doc/en/lb3/Introduction-to-User-model-authentication.html#login-as-the-new-user.

The `login` method can also be used programmatically behind other endpoints. For
example:

```js
router.post('/projects', function(req, res) {
  var email = req.body.email;
  var password = req.body.password;

  app.models.User.login(
    {
      email: email,
      password: password,
    },
    'user',
    function(err, token) {
      if (err)
        return res.render('index', {
          email: email,
          password: password,
          loginFailed: true,
        });

      token = token.toJSON();

      res.render('projects', {
        username: token.user.username,
        accessToken: token.id,
      });
    },
  );
});
```

See
https://github.com/strongloop/loopback-example-access-control/blob/master/server/boot/routes.js#L19-L41.

1. Implement the login endpoint in LoopBack 4:

We can add the `login` method to a controller and expose it as `/users/login`
endpoint:

- Login method

  - https://github.com/strongloop/loopback4-example-shopping/blob/master/packages/shopping/src/controllers/user.controller.ts#L204

  ```ts
  @post('/users/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody(CredentialsRequestBody) credentials: Credentials,
  ): Promise<{token: string}> {
    // ensure the user exists, and the password is correct
    const user = await this.userService.verifyCredentials(credentials);

    // convert a User object into a UserProfile object (reduced set of properties)
    const userProfile = this.userService.convertToUserProfile(user);

    // create a JSON Web Token based on the user profile
    const token = await this.jwtService.generateToken(userProfile);

    return {token};
  }
  ```

Optionally, we can provide `UserService` and `TokenService` to verify
credentials and generate access tokens.

- User service

  - https://github.com/strongloop/loopback4-example-shopping/blob/master/packages/shopping/src/services/user-service.ts

- Token service

  - https://github.com/strongloop/loopback4-example-shopping/blob/master/packages/shopping/src/services/jwt-service.ts

2. Reuse the `User` database from LB3

- Datasource for the User database
- UserCredentialsRepository

  - https://github.com/strongloop/loopback4-example-shopping/blob/master/packages/shopping/src/repositories/user-credentials.repository.ts

### Mark a method that requires authentication

- @authenticate

### Protect API calls with access tokens

- JWT strategy

  - https://github.com/strongloop/loopback4-example-shopping/blob/master/packages/shopping/src/authentication-strategies/jwt-strategy.ts

## Migrate the authorization flow

### Migrate ACLs

1. Decorate protected methods with `@authorize`

- https://github.com/strongloop/loopback4-example-shopping/blob/11c48ef222a7960cb266bd88878c0eb9f8138127/packages/shopping/src/controllers/user-order.controller.ts#L48

2. Implement an Authorizer

- https://github.com/strongloop/loopback4-example-shopping/blob/master/packages/shopping/src/services/authorizor.ts
