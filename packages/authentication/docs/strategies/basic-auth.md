You could find the `AuthenticationStrategy` interface in file
[authentication-strategy.md](./docs/authentication-strategy.md)

```ts
import {Request} from '@loopback/rest';

interface BasicAuthOptions = {
  // Define it as anyobject in the pseudo code
  [property: string]: any;
};

class BasicAuthenticationStrategy implements AuthenticationStrategy {
  options: object;
  constructor(
    @inject(AUTHENTICATION_BINDINGS.USER_SERVICE) userService: UserService,
    @inject(AUTHENTICATION_BINDINGS.BASIC_AUTH_OPTIONS) options?: BasicAuthOptions,
  ) {}

  authenticate(request: Request, options: BasicAuthOptions): Promise<UserProfile | undefined> {
    // override the global set options with the one passed from the caller
    options = options || this.options;
    // extract the username and password from request
    const credentials = await this.extractCredentials(request);
    // `verifyCredentials` throws error accordingly: user doesn't exist OR invalid credentials
    const user = await userService.verifyCredentials(credentials);
    return userService.convertToUserProfile(user);
  }

  extractCredentials(request): Promise<Credentials> {
    // code to extract username and password from request header
  }
}
```
