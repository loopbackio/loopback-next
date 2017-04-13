# loopback-next

[![Gitter](https://img.shields.io/gitter/room/nwjs/nw.js.svg)](https://gitter.im/strongloop/loopback)

LoopBack makes it easy to build modern applications that require complex integrations.

- Fast, small, powerful, extensible core
- Generate real APIs with a single command
- Define your data and endpoints with OpenAPI
- No maintenance of generated code

# Installation

Make sure you have the following installed:

- [Node.js](https://nodejs.org) >= 7.0.0
- [TypeScript](https://www.typescriptlang.org/) >= 2.0.0 `npm i -g typescript`
- [TypeScript Node](https://github.com/TypeStrong/ts-node) >= 3.0.0 `npm i -g ts-node`

Then:

```
npm i -S loopback-next (or wherever we publish)
cd node_modules/loopback-next
npm i -g lerna
lerna bootstrap
cd ../..
# proceed to creating index.ts
```

# Usage

```ts
export class UserController {
  public async getUserByName(username: string): Promise<UserResponse> {
    const users = new UserRepository();
    const user = await users.findOne({where: {username: username}});
    if (!user) {
      throw createHttpError.NotFound(`User ${username} not found.`);
    }
    return new UserResponse(user);
  }
}
```

# Documentation

- [FAQ](https://github.com/strongloop/loopback-next/wiki/FAQ)
- [Official documentation](https://github.com/strongloop/loopback-next/wiki/Official-documentation)
- [API documentation](https://github.com/strongloop/loopback-next/wiki/API-documentation)
- [Tutorials and examples](https://github.com/strongloop/loopback-next/wiki/Tutorials-and-examples)

# Contributing

- [Guidelines](https://github.com/strongloop/loopback-next/wiki/Contributing-guidelines)
- [Join the team](https://github.com/strongloop/loopback-next/wiki/Join-the-team)

# License

[MIT](https://github.com/strongloop/loopback-next/blob/master/LICENSE)
