## Multiple Authentication strategies

An authentication system in a LoopBack 4 application could potentially support
multiple popular strategies, including basic auth, oauth2, saml, openid-connect,
etc...And also allow programmers to use either a token based or a session based
approach to track the logged-in user.

The diagram below illustrates the high level abstraction of such an extensible
authentication system.

<img src="./imgs/multiple-auth-strategies-login.png" width="1000px" />

Assume the app has a static login page with a list of available choices for
users to login:

- local: basic auth with email/username + password
- facebook account: oauth2
- google account: oauth2
- ibm intranet account: saml
- openid account: openid-connect
- ...

For the local login, we retrieve the user from a local database.

For the third-party service login, e.g. facebook account login, we retrieve the
user info from the facebook authorization server using oauth2, then find or
create the user in the local database.

By clicking any one of the links, you login with a particular account and your
status will be tracked in a session(with session-based auth), or your profile
will be encoded into a JWT token(with token-based auth).

A common flow for all the login strategies would be: the authentication action
verifies the credentials and returns the raw information of that logged-in user.

Here the raw information refers to the data returned from a third-party service
or a persistent database. Therefore you need another step to convert it to a
user profile instance which describes your application's user model. Finally the
user profile is either tracked by a generated token OR a session + cookie.

The next diagram illustrates the flow of verifying the client requests sent
after the user has logged in.

<img src="./imgs/multiple-auth-strategies-verify.png" width="1000px" />

The request goes through the authentication action which invokes the
authentication strategy to decode/deserialize the user profile from the
token/session, binds it to the request context so that actions after
'authenticate' could inject it using DI.

Next let's walk through the typical API flow of user login and user
verification.

## API Flows (using BasicAuth + JWT as example)

Other than the LoopBack core and its authentication module, there are different
parts included and integrated together to perform the authentication.

The next diagram, using the BasicAuth + JWT authentication strategy as an
example, draws two API flows:

- Login: user login with email+password
- Verify: verify the logged-in user

along with the responsibilities divided among different parts:

- LoopBack core: resolve a strategy based on the endpoint's corresponding
  authentication metadata, execute the authentication action which invokes the
  strategy's `authenticate` method.

- Authentication strategy:

  - (login flow) verify user credentials and return a user profile(it's up to
    the programmer to create the JWT access token inside the controller
    function).
  - (verify flow) verify the token and decode user profile from it.

- Authentication services: some utility services that can be injected in the
  strategy class. (Each service's functionalities will be covered in the next
  section)

_Note: FixIt! the step 6 in the following diagram should be moved to LoopBack
side_

<img src="./imgs/API-flow-(JWT).png" width="1000px" />

_Note: Another section for session based auth TBD_

## Authentication framework architecture

The following diagram describes the architecture of the entire authentication
framework and the detailed responsibility of each part.

You can check the pseudo code in folder `docs` for:

- [authentication-action](./authentication-action.md)
- [authentication-strategy](./authentication-strategy.md)
- [basic auth strategy](./strategies/basic-auth.md)
- [jwt strategy](./strategies/jwt.md)
- [oauth2 strategy](./strategies/oauth2.md)
- [endpoints defined in controller](./controller-functions.md)

And the abstractions for:

- [user service](../src/services/user.service.ts)
- [token service](../src/services/token.service.ts)

<img src="./imgs/auth-framework-architecture.png" width="1000px" />

### Token based authentication

- Login flow

  - authentication action:
    - resolve metadata to get the strategy
    - invoke strategy.authenticate()
    - set the current user as the return of strategy.authenticate()
  - strategy:
    - extract credentials from
      - transport layer(request)
      - or local configuration file
    - verify credentials and return the user profile (call user service)
  - controller function:
    - generate token (call token service)
    - return token or serialize it into the response

- Verify flow
  - authentication action:
    - resolve metadata to get the strategy
    - invoke strategy.authenticate()
    - set the current user as the return of strategy.authenticate()
  - strategy:
    - extract access token from transport layer(request)
    - verify access token(call token service)
    - decode user from access token(call token service)
    - return user
  - controller:
    - process the injected user

### Session based authentication

- Login flow

  - authentication action:
    - resolve metadata to get the strategy
    - invoke strategy.authenticate()
  - strategy:
    - extract credentials from
      - transport layer (request)
      - or local configuration file
    - verify credentials (call user service) and return the user profile
  - controller:
    - serialize user info into the session

- Verify flow
  - authentication action:
    - resolve metadata to get the strategy
    - invoke strategy.authenticate()
    - set the current user as the return of strategy.authenticate()
  - strategy:
    - extract session info from cookie(call session service)
    - deserialize user info from session(call session service)
    - return user
  - controller function:
    - process the injected user

## Registering an authentication strategy via an extension point

Authentication strategies register themselves to an authentication strategy
provider using an
[Extension Point and Extensions](https://loopback.io/doc/en/lb4/Extension-point-and-extensions.html)
pattern.

The `AuthenticationStrategyProvider` class in
`src/providers/auth-strategy.provider.ts` (shown below) declares an
`extension point` named
`AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME` via the
`@extensionPoint` decorator. The binding scope is set to **transient** because
an authentication strategy **may** differ with each request.
`AuthenticationStrategyProvider` is responsible for finding (with the aid of the
`@extensions()` **getter** decorator) and returning an authentication strategy
which has a specific **name** and has been registered as an **extension** of the
aforementioned **extension point**.

```ts
@extensionPoint(
  AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
  {scope: BindingScope.TRANSIENT},
)
export class AuthenticationStrategyProvider
  implements Provider<AuthenticationStrategy | undefined> {
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
      // important not to throw a non-protocol-specific error here
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

The **name** of the strategy is specified in the `@authenticate` decorator that
is added to a controller method when authentication is desired for a specific
endpoint.

```ts
    class UserController {
      constructor() {}
      @get('/whoAmI')
      @authenticate('basic')
      whoAmI()
      {
        ...
      }
    }
```

An authentication strategy must implement the `AuthenticationStrategy` interface
defined in `src/types.ts`.

```ts
export interface BasicAuthenticationStrategyCredentials {
  email: string;
  password: string;
}

export class BasicAuthenticationStrategy implements AuthenticationStrategy {
  name: string = 'basic';

  constructor(
    @inject(BasicAuthenticationStrategyBindings.USER_SERVICE)
    private userService: BasicAuthenticationUserService,
  ) {}

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    const credentials: BasicAuthenticationStrategyCredentials = this.extractCredentials(
      request,
    );
    const user = await this.userService.verifyCredentials(credentials);
    const userProfile = this.userService.convertToUserProfile(user);

    return userProfile;
  }
```

A custom sequence must be created to insert the
`AuthenticationBindings.AUTH_ACTION` action. The `AuthenticateFn` function
interface is implemented by the `value()` function of
`AuthenticateActionProvider` class in `/src/providers/auth-action.provider.ts`.

```ts
export class SequenceIncludingAuthentication implements SequenceHandler {
  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS)
    protected parseParams: ParseParams,
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

      //call authentication action
      await this.authenticateRequest(request);

      // Authentication successful, proceed to invoke controller
      const args = await this.parseParams(request, route);
      const result = await this.invoke(route, args);
      this.send(response, result);
    } catch (error) {
      //
      // The authentication action utilizes a strategy resolver to find
      // an authentication strategy by name, and then it calls
      // strategy.authenticate(request).
      //
      // The strategy resolver throws a non-http error if it cannot
      // resolve the strategy. When the strategy resolver obtains
      // a strategy, it calls strategy.authenticate(request) which
      // is expected to return a user profile. If the user profile
      // is undefined, then it throws a non-http error.
      //
      // It is necessary to catch these errors and add HTTP-specific status
      // code property.
      //
      // Errors thrown by the strategy implementations already come
      // with statusCode set.
      //
      // In the future, we want to improve `@loopback/rest` to provide
      // an extension point allowing `@loopback/authentication` to contribute
      // mappings from error codes to HTTP status codes, so that application
      // don't have to map codes themselves.
      if (
        error.code === AUTHENTICATION_STRATEGY_NOT_FOUND ||
        error.code === USER_PROFILE_NOT_FOUND
      ) {
        Object.assign(error, {statusCode: 401 /* Unauthorized */});
      }

      this.reject(context, error);
      return;
    }
  }
}
```

Then custom sequence must be bound to the application, and the authentication
strategy must be added as an **extension** of the **extension point** using the
`addExtension` function.

```ts
export class MyApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options?: ApplicationConfig) {
    super(options);

    this.component(AuthenticationComponent);

    this.sequence(SequenceIncludingAuthentication);

    addExtension(
      this,
      AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
      BasicAuthenticationStrategy,
      {
        namespace:
          AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
      },
    );
  }
}
```
