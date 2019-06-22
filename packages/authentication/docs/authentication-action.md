### Auth action

```ts
import * as HttpErrors from 'http-errors';

async action(request: Request): Promise<UserProfile | undefined> {
    const authStrategy = await this.getAuthStrategy();
    if (!authStrategy) {
      // The invoked operation does not require authentication.
      return undefined;
    }

    try {
      const userProfile: UserProfile = await authStrategy.authenticate(request);
      this.setCurrentUser(userProfile);
      // a convenient return for the next request handlers
      return userProfile;
    } catch (err) {
      // interpret the raw error code/msg here and throw the corresponding HTTP error
      // convert it to http error
      if (err.code == '401') {
        throw new HttpErrors.Unauthorized(err.message);
      }
    }
  }
```
