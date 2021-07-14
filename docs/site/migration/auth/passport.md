---
lang: en
title: 'Migrating Passport-based authentication'
keywords:
  LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, LoopBack 3, Migration
sidebar: lb4_sidebar
permalink: /doc/en/lb4/migration-auth-passport.html
---

{% include tip.html content="
Missing instructions for your LoopBack 3 use case? Please report a [Migration docs issue](https://github.com/loopbackio/loopback-next/issues/new?labels=question,Migration,Docs&template=Migration_docs.md) on GitHub to let us know.
" %}

# Migrating Passport Strategies

This page is a guide to migrate LB3 apps that use
[Passport Strategies](http://www.passportjs.org/) for authentication use cases.
Before following this guide, please know more about the
[@loopback/authentication-passport](https://loopback.io/doc/en/lb4/Authentication-passport.html)
package.

## Differences between LoopBack 3 and LoopBack 4

In LoopBack 3, routes can be configured explicitly as authentication providers
using Express style passport strategies middleware. Also the
[LB3 passport component](https://github.com/loopbackio/loopback-component-passport)
helped with implicit authentication configuration using json files. It had
built-in model classes to search users and persist user identities.

In LoopBack 4, authentication endpoints are configured in controllers and the
`@authenticate` decorator tells which passport strategy to configure for that
API route. Also the
[@loopback/authentication-passport](https://loopback.io/doc/en/lb4/Authentication-passport.html)
package is necessary to bridge between passport strategies and the
authentication design of LB4.

## An example passport login app

To demonstrate how to implement passport strategies in LoopBack 4 and migrate
LB3 apps using
[loopback-component-passport](https://github.com/loopbackio/loopback-component-passport),
a
[passport-login](https://github.com/loopbackio/loopback-next/tree/master/examples/passport-login)
example app is now available.

This example is migrated from
[loopback-example-passport](https://github.com/loopbackio/loopback-example-passport),
it demonstrates how to use the LoopBack 4 features (like `@authenticate`
decorator, strategy providers, etc) with passport strategies. It includes OAuth2
strategies to interact with external OAuth providers like Facebook, Google, etc
as well as local and basic strategies.

Take a look at the test cases of the
[example app](https://github.com/loopbackio/loopback-next/tree/master/examples/passport-login)
and the
[mock social app for testing](https://github.com/loopbackio/loopback-next/tree/master/extensions/authentication-passport/src/__tests__/acceptance)

You can use this example to see how to:

- Log in or sign up into a LoopBack application using passport strategy modules
- Log in via external apps like Facebook or link those external profiles with a
  LoopBack user (for example, a LoopBack user can have associated
  Facebook/Google accounts to retrieve pictures).
- Use basic or local passport strategy modules

This guide is further divided into two sections:

- [How to migrate Non-OAuth2 strategies like basic, local, etc.](#Non-OAuth2-Strategies)
- [How to migrate OAuth2 strategies like Facebook, Google, etc.](#OAuth2-Strategies)

In each of these sections the following are explained:

A. Configuring Authentication Endpoints: Authentication/Login endpoints are
controller methods that validate user credentials and provide the caller with a
login session which is usually represented by an access token or a cookie.

B. Strategy Providers: In LoopBack4 passport strategies will have to be injected
into the authentication using provider classes.

## Non OAuth2 Strategies

- This section shows how to implement authentication schemes like basic, local,
  etc using passport strategies
- These authentication schemes validate users immediately without the need for
  redirection ie., authentication happens in a single phase in one
  request-response cycle.

### Configuring Authentication Endpoints

You can configure the authentication endpoints with the following steps:

- declare the `@authenticate` decorator before controller methods that needs
  access control
- include the binded name of the passport strategy provider as the decorator
  parameter
- the decorator tells LoopBack that the strategy returned by the provider must
  be called to validate user credentials

```ts
  @authenticate('session')
  @get('/whoAmI', {
    responses: USER_PROFILE_RESPONSE,
  })
  whoAmI(@inject(SecurityBindings.USER) user: UserProfile): object {
    /**
     * controller returns back currently logged in user information
     */
    return {
      user: user.profile,
      headers: Object.assign({}, this.req.headers),
    };
  }
```

```ts
  @authenticate('basic')
  @get('/profiles')
  async getExternalProfiles(
    @inject(SecurityBindings.USER) profile: UserProfile,
  ) {
    const user = await this.userRepository.findById(
      parseInt(profile[securityId]),
      {
        include: [
          {
            relation: 'profiles',
          },
        ],
      },
    );
    return user.profiles;
  }
```

### Strategy Providers

- Create a provider class that instantiates a passport strategy and wraps it
  with a strategy adapter. Please read on
  [@loopback/authentication-passport](https://loopback.io/doc/en/lb4/Authentication-passport.html).

```ts
/**
 * basic passport strategy
 */
@injectable(asAuthStrategy)
export class BasicStrategy implements AuthenticationStrategy {
  name = 'basic';
  passportstrategy: Strategy;
  strategy: StrategyAdapter<User>;

  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {
    /**
     * create a basic passport strategy with verify function to validate credentials
     */
    this.passportstrategy = new Strategy(this.verify.bind(this));
    /**
     * wrap the passport strategy instance with an adapter to plugin to LoopBack authentication
     */
    this.strategy = new StrategyAdapter(
      this.passportstrategy,
      this.name,
      mapProfile.bind(this),
    );
  }

  /**
   * authenticate a request
   * @param request
   */
  async authenticate(request: Request): Promise<UserProfile | RedirectRoute> {
    return this.strategy.authenticate(request);
  }
}
```

- Passport strategies also require a `verify` function to validate user
  credentials in the request. Include the `verify` function in the provider
  class.

```ts
  /**
   * authenticate user with provided username and password
   *
   * @param username
   * @param password
   * @param done
   *
   * @returns User model
   */
  verify(
    username: string,
    password: string,
    done: (error: any, user?: any) => void,
  ): void {
    this.userRepository
      .find({
        where: {
          email: username,
        }
      })
      .then((users: User[]) => {
        const user = users[0];
        if (!user.credentials || user.credentials.password !== password) {
          return done(null, false);
        }
        // Authentication passed, return user profile
        done(null, user);
      })
      .catch(err => {
        done(err);
      });
  }
```

- Bind the strategy provider class to the application

```ts
export class UserApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    this.add(createBindingFromClass(BasicStrategy));

    this.sequence(MySequence);
    this.component(AuthenticationComponent);
  }
}
```

## OAuth2 Strategies

- how to use passport strategies for OAuth2 authorization flow with external
  social apps like Facebook.
- this involves redirecting to an external app and user entering credentials in
  that app's login page.
- this usecase includes multiple phases of authentication.

### Configuring Authentication Endpoints

You can configure the authentication endpoints with the following steps:

- For OAuth2 authorizaton flow, we need authentication endpoints that
  participate to get the user validated with an external system.
- This essentially means the `@authenticate` decorator is used with different
  sematics compared to the non-OAuth2 section above.
- Here the controller methods become small parts of the larger OAuth2 dialog.
- We ideally create a controller with two endpoints decorated with
  `@authenticate(`{passport-strategy-name}`)`
- One of the endpoints is for redirecting to the external provider app and the
  other is for getting called back by the external app.

  - Create a controller with authentication endpoints as in below example:

    - A method to redirect to the third party app (method `loginToThirdParty` in
      the below example)

      - an endpoint for api clients to login via a third party app
      - the passport strategy identifies this call as a redirection to third
        party
      - this endpoint redirects to the third party authorization url

    - A method for the third Party app to callback
      - this is the callback for the thirdparty app (method `thirdPartyCallBack`
        in the below example)
      - on successful user login the third party calls this endpoint with an
        access code
      - the passport OAuth2 strategy exchanges the code for an access token
      - the passport OAuth2 strategy then calls the provided `verify()` function
        with the access token

```ts
  @authenticate('oauth2-Facebook')
  @get('/auth/thirdparty/Facebook')
  /**
   * Endpoint: '/auth/thirdparty/Facebook'
   *          an endpoint for api clients to login via FaceBook, redirects to FaceBook
   */
  loginToThirdParty(
    @inject(AuthenticationBindings.AUTHENTICATION_REDIRECT_URL)
    redirectUrl: string,
    @inject(AuthenticationBindings.AUTHENTICATION_REDIRECT_STATUS)
    status: number,
    @inject(RestBindings.Http.RESPONSE)
    response: Response,
  ) {
    response.statusCode = status || 302;
    response.setHeader('Location', redirectUrl);
    response.end();
    return response;
  }

  @authenticate('oauth2-Facebook')
  @get('/auth/thirdparty/Facebook/callback')
  /**
   * Endpoint: '/auth/thirdparty/Facebook/callback'
   *          an endpoint which serves as a oauth2 callback for FaceBook
   *          this endpoint sets the user profile in the session
   */
  async thirdPartyCallBack(
    @inject(SecurityBindings.USER) user: UserProfile, // Profile from FaceBook
    @inject(RestBindings.Http.REQUEST) request: RequestWithSession,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {
    const profile = {
      ...user.profile,
    };
    request.session.user = profile;
    response.redirect('/auth/account');
    return response;
  }
```

- Once `thirdPartyCallBack` endpoint has the profile from the external
  authentication, it can proceed in three (or more) different ways.
  - It can create a browser session. This is the most popular one we use
    everyday to login to an app using Facebook/Google credentials. This means
    the client from there on would use the passport-session strategy to access
    other Usecase endpoints in the LoopBack App (session strategy).
  - it can return the original oauth token from the third-party to the web
    client which can then call the external app's usecase endpoints using the
    token as a Bearer (jwt strategy).
  - it can create a new token with the same expiration time of the original
    thirdparty token (the exp field in that token says it) and send that to the
    web client (jwt strategy).

### Strategy Providers

- Create a provider class that instantiates a passport strategy and wraps it
  with a strategy adapter. Please read on
  [@loopback/authentication-passport](https://loopback.io/doc/en/lb4/Authentication-passport.html).

```ts
@injectable(
  asAuthStrategy,
  extensionFor(PassportAuthenticationBindings.OAUTH2_STRATEGY),
)
export class FaceBookOauth2Authorization implements AuthenticationStrategy {
  name = 'oauth2-Facebook';
  protected strategy: StrategyAdapter<User>;
  passportstrategy: Strategy;

  /**
   * create an oauth2 strategy for Facebook
   */
  constructor(
    @inject(UserServiceBindings.PASSPORT_USER_IDENTITY_SERVICE)
    public userService: UserIdentityService<Profile, User>,
    @inject('FacebookOAuth2Options')
    public FacebookOptions: StrategyOption,
  ) {
    this.passportstrategy = new Strategy(
      FacebookOptions,
      verifyFunctionFactory(userService).bind(this),
    );
    this.strategy = new StrategyAdapter(
      this.passportstrategy,
      this.name,
      mapProfile.bind(this),
    );
  }

  /**
   * authenticate a request
   * @param request
   */
  async authenticate(request: Request): Promise<UserProfile | RedirectRoute> {
    return this.strategy.authenticate(request);
  }
}
```

- Bind the strategy provider class to the application

```ts
export class OAuth2LoginApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    this.add(createBindingFromClass(FaceBookOauth2Authorization));
    this.add(createBindingFromClass(GoogleOauth2Authorization));

    this.sequence(MySequence);
    this.component(AuthenticationComponent);
  }
}
```
