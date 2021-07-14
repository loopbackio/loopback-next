You could find the `AuthenticationStrategy` interface in file
[authentication-strategy.md](./docs/authentication-strategy.md)

```ts
import {Request} from '@loopback/rest';

interface JWTAuthOptions = {
  // Define it as anyobject in the pseudo code
  [property: string]: any;
};
class JWTAuthenticationStrategy implements AuthenticationStrategy {
  constructor(
    @inject(AUTHENTICATION_BINDINGS.USER_SERVICE) tokenService: TokenService,
    @inject(AUTHENTICATION_BINDINGS.JWT_AUTH_OPTIONS) options?: JWTAuthOptions,
  ) {}

  authenticate(
    request: Request,
    options: JWTAuthOptions,
  ): Promise<UserProfile | undefined> {
    // override the global set options with the one passed from the caller
    options = options || this.options;
    // extract the username and password from request
    const token = await this.extractCredentials(request);
    // `verifyToken` should decode the payload from the token and convert the token payload to
    // userProfile object.
    return tokenService.verifyToken(token);
  }

  extractCredentials(request): Promise<string> {
    // code to extract json web token from request header/cookie/query
  }
}
```
