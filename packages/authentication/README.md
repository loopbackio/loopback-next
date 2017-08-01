# @loopback/authentication

A LoopBack component for authentication support.

# Overview
 It demonstrates how to use LoopBack's user models and passport to interact with other authentication providers.
 User can login using a passport.js strategy, which could include a third party provider.


# Installation

```shell
npm install --save @loopback/authentication
```

# Basic use


 ```ts
  const strategy = new BasicStrategy(async (username, password) => {
  return await findUser(username, password);
  };
 getAuthenticatedUser(strategy, ParsedRequest);
```


# Related resources

For more info about passport, see [passport.js](http://passportjs.org/).

# Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/wiki/Contributing#guidelines)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

# Tests

run `npm test` from the root folder.

# Contributors

See [all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

# License

MIT
