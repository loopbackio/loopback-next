---
lang: en
title: 'Authentication Action'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Authentication-component-action.html
---

{% include note.html content="
This is not needed for [middleware-based
sequence](REST-middleware-sequence.md) as the authentication is enforced by a
middleware that's automatically discovered and added to the sequence.
" %}

## Adding an Authentication Action to a Custom Sequence

In a LoopBack 4 application with REST API endpoints, each request passes through
a stateless grouping of actions called a [Sequence](Sequence.md).

The default sequence which injects and invokes actions `findRoute`,
`parseParams`, `invoke`, `send`, `reject` could be found in the
[Todo example's sequence file](https://github.com/loopbackio/loopback-next/blob/master/examples/todo/src/sequence.ts).

To know more details of what each action does, click the code snippet below with
more descriptions.

<details>
<summary markdown="span">Click to view the details of the default sequence</summary>

```ts
export class DefaultSequence implements SequenceHandler {
  /**
   * Constructor: Injects findRoute, invokeMethod & logError
   * methods as promises.
   *
   * @param {FindRoute} findRoute Finds the appropriate controller method,
   *  spec and args for invocation (injected via SequenceActions.FIND_ROUTE).
   * @param {ParseParams} parseParams The parameter parsing function (injected
   * via SequenceActions.PARSE_PARAMS).
   * @param {InvokeMethod} invoke Invokes the method specified by the route
   * (injected via SequenceActions.INVOKE_METHOD).
   * @param {Send} send The action to merge the invoke result with the response
   * (injected via SequenceActions.SEND)
   * @param {Reject} reject The action to take if the invoke returns a rejected
   * promise result (injected via SequenceActions.REJECT).
   */
  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
  ) {}

  /**
   * Runs the default sequence. Given a handler context (request and response),
   * running the sequence will produce a response or an error.
   *
   * Default sequence executes these steps
   *  - Finds the appropriate controller method, swagger spec
   *    and args for invocation
   *  - Parses HTTP request to get API argument list
   *  - Invokes the API which is defined in the Application Controller
   *  - Writes the result from API into the HTTP response
   *  - Error is caught and logged using 'logError' if any of the above steps
   *    in the sequence fails with an error.
   *
   * @param context The request context: HTTP request and response objects,
   * per-request IoC container and more.
   */
  async handle(context: RequestContext): Promise<void> {
    try {
      const {request, response} = context;
      const route = this.findRoute(request);
      const args = await this.parseParams(request, route);
      const result = await this.invoke(route, args);

      debug('%s result -', route.describe(), result);
      this.send(response, result);
    } catch (error) {
      this.reject(context, error);
    }
  }
}
```

</details>

By default, `authenticate` is **not** part of the sequence of actions, so you
must modify the default sequence and add the authentication action.

An authentication action `AuthenticateFn` is provided by the
`AuthenticateActionProvider` class.

`AuthenticateActionProvider` is defined as follows:

```ts
// ------ CODE THAT EXPLAINS THE MECHANISM ---------
export class AuthenticateActionProvider implements Provider<AuthenticateFn> {
  constructor(
    // The provider is instantiated for Sequence constructor,
    // at which time we don't have information about the current
    // route yet. This information is needed to determine
    // what auth strategy should be used.
    // To solve this, we are injecting a getter function that will
    // defer resolution of the strategy until authenticate() action
    // is executed.
    @inject.getter(AuthenticationBindings.STRATEGY)
    readonly getStrategy: Getter<AuthenticationStrategy>,
    @inject.setter(SecurityBindings.USER)
    readonly setCurrentUser: Setter<UserProfile>,
  ) {}

  /**
   * @returns authenticateFn
   */
  value(): AuthenticateFn {
    return request => this.action(request);
  }

  /**
   * The implementation of authenticate() sequence action.
   * @param request The incoming request provided by the REST layer
   */
  async action(request: Request): Promise<UserProfile | undefined> {
    const strategy = await this.getStrategy();
    if (!strategy) {
      // The invoked operation does not require authentication.
      return undefined;
    }

    const userProfile = await strategy.authenticate(request);
    if (!userProfile) {
      // important to throw a non-protocol-specific error here
      let error = new Error(
        `User profile not returned from strategy's authenticate function`,
      );
      Object.assign(error, {
        code: USER_PROFILE_NOT_FOUND,
      });
      throw error;
    }

    this.setCurrentUser(userProfile);
    return userProfile;
  }
}
```

`AuthenticateActionProvider`'s `value()` function returns a function of type
`AuthenticateFn`. This function attempts to obtain an authentication strategy
(resolved by `AuthenticationStrategyProvider` via the
`AuthenticationBindings.STRATEGY` binding). If **no** authentication strategy
was specified for this endpoint, the action immediately returns. If an
authentication strategy **was** specified for this endpoint, its
`authenticate(request)` function is called. If a user profile is returned, this
means the user was authenticated successfully, and the user profile is added to
the request context (via the `SecurityBindings.USER` binding); otherwise an
error is thrown.

Here is an example of a modified sequence which utilizes the `authenticate`
action.

```ts
export class MyAuthenticatingSequence implements SequenceHandler {
  constructor(
    // ... Other injections
    // ------ ADD SNIPPET ---------
    @inject(AuthenticationBindings.AUTH_ACTION)
    protected authenticateRequest: AuthenticateFn, // ------------- END OF SNIPPET -------------
  ) {}

  async handle(context: RequestContext) {
    try {
      const {request, response} = context;
      const route = this.findRoute(request);

      // ------ ADD SNIPPET ---------
      //call authentication action
      await this.authenticateRequest(request);
      // ------------- END OF SNIPPET -------------

      // Authentication successful, proceed to invoke controller
      const args = await this.parseParams(request, route);
      const result = await this.invoke(route, args);
      this.send(response, result);
    } catch (error) {
      // ------ ADD SNIPPET ---------
      if (
        error.code === AUTHENTICATION_STRATEGY_NOT_FOUND ||
        error.code === USER_PROFILE_NOT_FOUND
      ) {
        Object.assign(error, {statusCode: 401 /* Unauthorized */});
      }
      // ------------- END OF SNIPPET -------------

      this.reject(context, error);
      return;
    }
  }
}
```

Notice the new dependency injection in the sequence's constructor.

```ts
@inject(AuthenticationBindings.AUTH_ACTION)
protected authenticateRequest: AuthenticateFn,
```

The binding key `AuthenticationBindings.AUTH_ACTION` gives us access to the
authentication function `authenticateRequest` of type `AuthenticateFn` provided
by `AuthenticateActionProvider`.

Now the authentication function `authenticateRequest` can be called in our
custom sequence anywhere before the `invoke` action in order secure the
endpoint.

There are two particular protocol-agnostic errors
`AUTHENTICATION_STRATEGY_NOT_FOUND` and `USER_PROFILE_NOT_FOUND` which must be
addressed in the sequence, and given an HTTP status code of 401 (UnAuthorized).

It is up to the developer to throw the appropriate HTTP error code from within a
custom authentications strategy or its custom services.

If any error is thrown during the authentication process, the controller
function of the endpoint is never executed.

## Binding the Authenticating Sequence to the Application

Now that we've defined a custom sequence that performs an authentication action
on every request, we must bind it to the application `application.ts`

{% include code-caption.html content="application.ts`" %}

```ts
export class MyApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options?: ApplicationConfig) {
    super(options);

    //...

    // ------ ADD SNIPPET ---------
    this.sequence(MyAuthenticatingSequence);
    // ------------- END OF SNIPPET -------------

    //...
  }
}
```

## Navigation

Next topic: [Authentication Strategy](Authentication-component-strategy.md)

Previous topic:
[Authentication Decorator](Authentication-component-decorator.md)
