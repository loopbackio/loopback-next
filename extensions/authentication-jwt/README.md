# @loopback/extension-authentication-jwt

This module exports the jwt authentication strategy and its corresponding token
and user service as a component. You can mount the component to get a prototype
token based authentication system in your LoopBack 4 application.

## Usage

To use this component, you need to have an existing LoopBack 4 application and a
datasource in it for persistency.

- create app: run `lb4 app`
- create datasource: run `lb4 datasource`

Next enable the jwt authentication system in your application:

- add authenticate action

<details>
<summary><strong>Check The Code</strong></summary>
<p>

```ts
import {
  AuthenticateFn,
  AuthenticationBindings,
  AUTHENTICATION_STRATEGY_NOT_FOUND,
  USER_PROFILE_NOT_FOUND,
} from '@loopback/authentication';
export class MySequence implements SequenceHandler {
  constructor(
    // - enable jwt auth -
    // inject the auth action
    @inject(AuthenticationBindings.AUTH_ACTION)
    protected authenticateRequest: AuthenticateFn,
  ) {}

  async handle(context: RequestContext) {
    try {
      const {request, response} = context;
      const route = this.findRoute(request);
      // - enable jwt auth -
      // call authentication action
      await this.authenticateRequest(request);

      const args = await this.parseParams(request, route);
      const result = await this.invoke(route, args);
      this.send(response, result);
    } catch (error) {
      // - enable jwt auth -
      // improve the error check
      if (
        error.code === AUTHENTICATION_STRATEGY_NOT_FOUND ||
        error.code === USER_PROFILE_NOT_FOUND
      ) {
        Object.assign(error, {statusCode: 401 /* Unauthorized */});
      }
      this.reject(context, error);
    }
  }
}
```

</p>
</details>

- mount jwt component in application

<details>
<summary><strong>Check The Code</strong></summary>
<p>

```ts
import {AuthenticationComponent} from '@loopback/authentication';
import {
  JWTAuthenticationComponent,
  SECURITY_SCHEME_SPEC,
} from '@loopback/extension-authentication-jwt';

export class TestApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // - enable jwt auth -
    // Add security spec (Future work: refactor it to an enhancer)
    this.addSecuritySpec();
    // Mount authentication system
    this.component(AuthenticationComponent);
    // Mount jwt component
    this.component(JWTAuthenticationComponent);
    // Bind datasource
    this.dataSource(DbDataSource, UserServiceBindings.DATASOURCE_NAME);

    this.component(RestExplorerComponent);
    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {};
  }

  // - enable jwt auth -
  // Currently there is an extra function to
  // merge the security spec into the application.
  // This will be improved with a coming enhancer.
  // See section [Future Work](#future-work)
  addSecuritySpec(): void {
    this.api({
      openapi: '3.0.0',
      info: {
        title: 'test application',
        version: '1.0.0',
      },
      paths: {},
      components: {securitySchemes: SECURITY_SCHEME_SPEC},
      security: [
        {
          // secure all endpoints with 'jwt'
          jwt: [],
        },
      ],
      servers: [{url: '/'}],
    });
  }
}
```

</p>
</details>

_All the jwt authentication related code are marked with comment "- enable jwt
auth -", you can search for it to find all the related code you need to enable
the entire jwt authentication in a LoopBack 4 application._

## Adding Endpoint in Controller

After mounting the component, you can call token and user services to perform
login, then decorate endpoints with `@authentication('jwt')` to inject the
logged in user's profile.

This module contains an example application in the `fixtures` folder. It has a
controller with endpoints `/login` and `/whoAmI`.

The code snippet for login function:

```ts
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

The code snippet for whoAmI function:

```ts
@authenticate('jwt')
  async whoAmI(): Promise<string> {
    return this.user[securityId];
  }
```

The complete file is in
[user.controller.ts](https://github.com/strongloop/loopback-next/tree/master/extensions/authentication-jwt/src/__tests__/fixtures/controllers/user.controller.ts)

## Customization

As a prototype implementation this module provides basic functionalities in each
service. You can customize and re-bind any element provided in the
[component](https://github.com/strongloop/loopback-next/tree/master/extensions/authentication-jwt/src/jwt-authentication-component.ts)
with your own one.

Replacing the `User` model is a bit more complicated because it's not injected
but imported directly in related files. The sub-section covers the steps to
provide your own `User` model and repository.

### Customizing User

1. Create your own user model and repository by running the `lb4 model` and
   `lb4 repository` commands.

2. The user service requires the user model and repository, to provide your own
   ones, you can create a custom `UserService` and bind it to
   `UserServiceBindings.USER_SERVICE`. Take a look at
   [the default user service](https://github.com/strongloop/loopback-next/blob/master/extensions/authentication-jwt/src/services/user.service.ts)
   for an example of `UserService` implementation.

   For convenience, here is the code in `user.service.ts`. You can replace the
   `User` and `UserRepository` with `MyUser`, `MyUserRepository`:

   <details>
   <summary><strong>Check The Code</strong></summary>
   <p>

   ```ts
   import {UserService} from '@loopback/authentication';
   import {repository} from '@loopback/repository';
   import {HttpErrors} from '@loopback/rest';
   import {securityId, UserProfile} from '@loopback/security';
   import {compare} from 'bcryptjs';
   // User --> MyUser
   import {MyUser} from '../models';
   // UserRepository --> MyUserRepository
   import {MyUserRepository} from '../repositories';

   export type Credentials = {
     email: string;
     password: string;
   };

   // User --> MyUser
   export class CustomUserService implements UserService<MyUser, Credentials> {
     constructor(
       // UserRepository --> MyUserRepository
       @repository(MyUserRepository) public userRepository: MyUserRepository,
     ) {}

     // User --> MyUser
     async verifyCredentials(credentials: Credentials): Promise<MyUser> {
       const invalidCredentialsError = 'Invalid email or password.';

       const foundUser = await this.userRepository.findOne({
         where: {email: credentials.email},
       });
       if (!foundUser) {
         throw new HttpErrors.Unauthorized(invalidCredentialsError);
       }

       const credentialsFound = await this.userRepository.findCredentials(
         foundUser.id,
       );
       if (!credentialsFound) {
         throw new HttpErrors.Unauthorized(invalidCredentialsError);
       }

       const passwordMatched = await compare(
         credentials.password,
         credentialsFound.password,
       );

       if (!passwordMatched) {
         throw new HttpErrors.Unauthorized(invalidCredentialsError);
       }

       return foundUser;
     }

     // User --> MyUser
     convertToUserProfile(user: MyUser): UserProfile {
       return {
         [securityId]: user.id.toString(),
         name: user.username,
         id: user.id,
         email: user.email,
       };
     }
   }
   ```

   </p>
   </details>

3. Bind `MyUserRepository` (and `MyUserCredentialsRepository` if you create your
   own as well) to the corresponding key in your `application.ts`:

   ```ts
   import {CustomUserService} from './services/custom-user-service';
   import {MyUserRepository, MyUserCredentialsRepository} from './repositories';
   import {UserServiceBindings} from '@loopback/extension-authentication-jwt';

   export class TestApplication extends BootMixin(
     ServiceMixin(RepositoryMixin(RestApplication)),
   ) {
     constructor(options: ApplicationConfig = {}) {
       super(options);
       // ...other setup
       this.component(JWTAuthenticationComponent);
       // Bind datasource
       this.dataSource(DbDataSource, UserServiceBindings.DATASOURCE_NAME);
       // Bind user service
       this.bind(UserServiceBindings.USER_SERVICE).toClass(CustomUserService),
       // Bind user and credentials repository
       this.bind(UserServiceBindings.USER_REPOSITORY).toClass(
         UserRepository,
       ),
       this.bind(UserServiceBindings.USER_CREDENTIALS_REPOSITORY).toClass(
         UserCredentialsRepository,
       ),
     }
   }
   ```

## Future Work

The security specification is currently manually added in the application file.
The next step is to create an enhancer in the component to automatically bind
the spec when app starts.

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
