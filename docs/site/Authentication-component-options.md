---
lang: en
title: 'Managing Custom Authentication Strategy Options'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Authentication-component-options.html
---

## Managing Custom Authentication Strategy Options

This is an **optional** step.

If your custom authentication strategy doesn't require special options, you can
skip this section.

As previously mentioned in the
[Authentication Decorator](Authentication-component-decorator.md) section, a
custom authentication strategy should avoid repeatedly specifying its
**default** options in the **@authenticate** decorator. Instead, it should
define its **default** options in one place, and only specify **overriding**
options in the **@authenticate** decorator when necessary.

Here are the steps for accomplishing this.

### Default authentication metadata

In some cases, it's desirable to have a default authentication enforcement for
methods that are not explicitly decorated with `@authenticate`. To do so, we can
simply configure the authentication component with `defaultMetadata` as follows:

```ts
app
  .configure(AuthenticationBindings.COMPONENT)
  .to({defaultMetadata: {strategy: 'xyz'}});
```

If multiple strategies are used for a given method, we can configure the
`failOnError` option so that a strategy can abort the authentication process by
throwing an error. Otherwise, other strategies will be invoked and it only fails
when none of the strategies succeeds by returning a `UserProfile` or
`RedirectRoute`.

```ts
app.configure(AuthenticationBindings.COMPONENT).to({failOnError: true});
```

### Define the Options Interface and Binding Key

Define an options interface and a binding key for the default options of that
specific authentication strategy.

```ts
export interface AuthenticationStrategyOptions {
  [property: string]: any;
}

export namespace BasicAuthenticationStrategyBindings {
  export const DEFAULT_OPTIONS = BindingKey.create<AuthenticationStrategyOptions>(
    'authentication.strategies.basic.defaultoptions',
  );
}
```

### Bind the Default Options

Bind the **default** options of the custom authentication strategy to the
application `application.ts` via the
`BasicAuthenticationStrategyBindings.DEFAULT_OPTIONS` binding key.

In this hypothetical example, our custom authentication strategy has a
**default** option of `gatherStatistics` with a value of `true`. (In a real
custom authentication strategy, the number of options could be more numerous)

```ts
export class MyApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options?: ApplicationConfig) {
    super(options);

    //...
    this.bind(BasicAuthenticationStrategyBindings.DEFAULT_OPTIONS).to({
      gatherStatistics: true,
    });
    //...
  }
}
```

### Override Default Options In Authentication Decorator

Specify overriding options in the `@authenticate` decorator only when necessary.

In this example, we only specify an **overriding** option
`{gatherStatistics: false}` for the `/scareme` endpoint. We use the **default**
option value for the `/whoami` endpoint.

```ts
import {inject} from '@loopback/context';
import {AuthenticationBindings, authenticate} from '@loopback/authentication';
import {UserProfile, securityId} from '@loopback/security';
import {get} from '@loopback/rest';

export class WhoAmIController {
  constructor(
    @inject(SecurityBindings.USER)
    private userProfile: UserProfile,
  ) {}

  @authenticate('basic')
  @get('/whoami')
  whoAmI(): string {
    return this.userProfile[securityId];
  }

  @authenticate('basic', {gatherStatistics: false})
  @get('/scareme')
  scareMe(): string {
    return 'boo!';
  }
}
```

### Update Custom Authentication Strategy to Handle Options

The custom authentication strategy must be updated to handle the loading of
default options, and overriding them if they have been specified in the
`@authenticate` decorator.

Here is the updated `BasicAuthenticationStrategy`:

```ts
import {
  AuthenticationStrategy,
  TokenService,
  AuthenticationMetadata,
  AuthenticationBindings,
} from '@loopback/authentication';
import {UserProfile} from '@loopback/security';
import {Getter} from '@loopback/core';

export interface Credentials {
  username: string;
  password: string;
}

export class BasicAuthenticationStrategy implements AuthenticationStrategy {
  name: string = 'basic';

  // ------ ADD SNIPPET ---------
  @inject(BasicAuthenticationStrategyBindings.DEFAULT_OPTIONS)
  options: AuthenticationStrategyOptions;
  // ----- END OF SNIPPET -------

  constructor(
    @inject(UserServiceBindings.USER_SERVICE)
    private userService: UserService,
    @inject.getter(AuthenticationBindings.METADATA)
    readonly getMetaData: Getter<AuthenticationMetadata>,
  ) {}

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    const credentials: Credentials = this.extractCredentials(request);
    // ------ ADD SNIPPET ---------
    await this.processOptions();

    if (this.options.gatherStatistics === true) {
      console.log(`\nGathering statistics...\n`);
    } else {
      console.log(`\nNot gathering statistics...\n`);
    }
    // ----- END OF SNIPPET -------

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

  async processOptions() {
    /**
        Obtain the options object specified in the @authenticate decorator
        of a controller method associated with the current request.
        The AuthenticationMetadata interface contains : strategy:string, options?:object
        We want the options property.
    */
    const controllerMethodAuthenticationMetadata = await this.getMetaData();

    if (!this.options) this.options = {}; //if no default options were bound, assign empty options object

    //override default options with request-level options
    this.options = Object.assign(
      {},
      this.options,
      controllerMethodAuthenticationMetadata.options,
    );
  }
}
```

**Inject** default options into a property `options` using the
`BasicAuthenticationStrategyBindings.DEFAULT_OPTIONS` binding key.

**Inject** a `getter` named `getMetaData` that returns `AuthenticationMetadata`
using the `AuthenticationBindings.METADATA` binding key. This metadata contains
the parameters passed into the `@authenticate` decorator.

Create a function named `processOptions()` that obtains the default options, and
overrides them with any request-level overriding options specified in the
`@authenticate` decorator.

Then, in the `authenticate()` function of the custom authentication strategy,
call the `processOptions()` function, and have the custom authentication
strategy react to the updated options.

## Summary

We've gone through the main steps for adding `authentication` to your LoopBack 4
application.

Your `application.ts` should look similar to this:

```ts
import {
  AuthenticationComponent,
  registerAuthenticationStrategy,
} from '@loopback/authentication';

export class MyApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options?: ApplicationConfig) {
    super(options);

    /* set up miscellaneous bindings */

    //...

    // ------ ADD SNIPPET ---------
    // load the authentication component
    this.component(AuthenticationComponent);

    // register your custom authentication strategy
    registerAuthenticationStrategy(this, BasicAuthenticationStrategy);

    // use your custom authenticating sequence
    this.sequence(MyAuthenticatingSequence);
    // ------------- END OF SNIPPET -------------

    this.static('/', path.join(__dirname, '../public'));

    this.projectRoot = __dirname;

    this.bootOptions = {
      controllers: {
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
```

You can find a **completed example** and **tutorial** of a LoopBack 4
application with JWT authentication
[here](./tutorials/authentication/Authentication-Tutorial.md).
