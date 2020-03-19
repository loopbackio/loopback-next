# @loopback/example-access-control-migration

This example is migrated from
[loopback-example-access-control](https://github.com/strongloop/loopback-example-access-control),
and uses the authentication and authorization system in LoopBack 4 to implement
the access control.

## Overview

This tutorial demonstrates how to implement a RBAC(Role Based Access Control)
system and provides 5 endpoints to test different role's permissions. The
tutorial of building it from a dummy application documented in
[auth-example-migration-tutorial](https://github.com/strongloop/loopback-next/blob/auth-migration/docs/site/migration/auth/example.md)

## Setup

First, you'll need to install a supported version of Node:

- [Node.js](https://nodejs.org/en/) at v10 or greater

Additionally, this tutorial assumes that you are comfortable with certain
technologies, languages and concepts.

- JavaScript (ES6)
- [REST](http://www.restapitutorial.com/lessons/whatisrest.html)

Lastly, you'll need to install the LoopBack 4 CLI toolkit:

```sh
npm i -g @loopback/cli
```

## Try it out

If you'd like to see the final results of this tutorial as an example
application, follow these steps:

```sh
  $ npm start

  Server is running at http://127.0.0.1:3000
```

Then try different roles' permissions by following the
[try it out section](https://github.com/strongloop/loopback-next/blob/auth-migration/docs/site/migration/auth/example.md#try-it-out)

### Need help?

Check out our [Gitter channel](https://gitter.im/strongloop/loopback) and ask
for help with this tutorial.

### Bugs/Feedback

Open an issue in [loopback-next](https://github.com/strongloop/loopback-next)
and we'll take a look.

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
