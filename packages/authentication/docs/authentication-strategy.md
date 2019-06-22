### Authentication strategy interface

```ts
import {Request} from '@loopback/rest';

/**
 * An interface that describes the common authentication strategy.
 *
 * An authentication strategy is a class with an
 * 'authenticate' method that verifies a user's credentials and
 * returns the corresponding user profile.
 *
 */
export interface AuthenticationStrategy {
  /**
   * The 'name' property is a unique identifier for the
   * authentication strategy ( for example : 'basic', 'jwt', etc)
   */
  name: string;

  /**
   * The 'authenticate' method takes in a given request and returns a user profile
   * which is an instance of 'UserProfile'.
   * (A user profile is a minimal subset of a user object)
   * If the user credentials are valid, this method should return a 'UserProfile' instance.
   * If the user credentials are invalid, this method should throw an error
   * If the user credentials are missing, this method should throw an error, or return 'undefined'
   * and let the authentication 'action' in the 'sequence' deal with it.
   *
   * @param request
   */
  authenticate(request: Request): Promise<UserProfile | undefined>;
}
```

An authentication strategy resolver can make use of the `name` property to
`find` the registered authentication strategy.

The authentication strategy interface has an `authenticate` function which takes
in a request and returns a user profile.

Authentication strategies that implement this interface can use dependency
injection in the constructor to obtain **global** or **request-specific**
`options` or any `services` it may require (a service to extract credentials
from a request, for example).
