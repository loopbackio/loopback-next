### Auth strategy interface

```ts
import {Request} from '@loopback/rest';

interface AuthenticationStrategy {
  // The resolver will read the `options` object from metadata, then invoke the
  // `authenticate` with `options` if it exists.
  authenticate(
    request: Request,
    options: object,
  ): Promise<UserProfile | undefined>;

  // This is a private function that extracts credential fields from a request,
  // it is called in function `authenticate`. You could organize the extraction
  // logic in this function or write them in `authenticate` directly without defining
  // this extra utility.
  private extractCredentials?(request: Request): Promise<Credentials>;
}
```
