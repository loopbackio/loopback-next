# @loopback/authentication

A LoopBack 4 component for authentication support.

## Overview

![AuthenticationComponent](https://raw.githubusercontent.com/strongloop/loopback-next/master/packages/authentication/docs/imgs/authentication_overview_highlevel.png)

This component contains the core logic for the authentication layer in
LoopBack 4.

It contains:

- A decorator to express an authentication requirement on controller methods
- A provider to access method-level authentication metadata
- An action in the REST sequence to enforce authentication
- An extension point to discover all authentication strategies and handle the
  delegation

## Installation

```shell
npm install --save @loopback/authentication
```

## Basic Use

[Load the AuthenticationComponent](https://loopback.io/doc/en/lb4/Loopback-component-authentication.html#authentication-component)
into your application.

**Extension developers** need to:

- [create custom authentication strategies](https://loopback.io/doc/en/lb4/Loopback-component-authentication.html#creating-a-custom-authentication-strategy)

**Application Developers** need to:

- [decorate controller functions with the authentication decorator](https://loopback.io/doc/en/lb4/Loopback-component-authentication.html#using-the-authentication-decorator)
- [add the authentication action to a custom sequence](https://loopback.io/doc/en/lb4/Loopback-component-authentication.html#adding-an-authentication-action-to-a-custom-sequence)
  and
  [bind the custom sequence to the application](https://loopback.io/doc/en/lb4/Loopback-component-authentication.html#binding-the-authenticating-sequence-to-the-application)
- [register the authentication strategies](https://loopback.io/doc/en/lb4/Loopback-component-authentication.html#registering-a-custom-authentication-strategy)

[Create and register a passport based strategy](https://www.npmjs.com/package/@loopback/authentication-passport)

## Related resources

For detailed documentation, see
[AuthenticationComponent](https://loopback.io/doc/en/lb4/Loopback-component-authentication.html).

For a tutorial on how to add **JWT** authentication to an application, see
[How to secure your LoopBack 4 application with JWT authentication](https://loopback.io/doc/en/lb4/Authentication-Tutorial.html).

For some background on our design decisions, please read
[Multiple Authentication strategies](./docs/authentication-system.md).

## Note

Starting from version `@loobpack/authentication@3.0.0`, `UserProfile` needs to
be imported from @loopback/security and it's not backward compatible with the
one exported from `@loobpack/authentication@2.x`. Make sure you follow the
[new tutorial](https://loopback.io/doc/en/lb4/Loopback-component-authentication.html)
to build the authentication system.

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
