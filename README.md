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

```shell
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

# Team

Ritchie Martori|Raymond Feng|Miroslav Bajtos|Rand McKinney|Simon Ho
:-:|:-:|:-:|:-:|:-:
<a href="http://github.com/ritch"><img src="https://avatars2.githubusercontent.com/u/462228?v=3&s=60">|<a href="http://github.com/raymondfeng"><img src="https://avatars0.githubusercontent.com/u/540892?v=3&s=60"></a>|<a href="http://github.com/bajtos"><img src="https://avatars2.githubusercontent.com/u/1140553?v=3&s=60"></a>|<a href="http://github.com/crandmck"><img src="https://avatars2.githubusercontent.com/u/2925364?v=3&s=60">|<a href="http://github.com/superkhau"><img src="https://avatars1.githubusercontent.com/u/1617364?v=3&s=60"></a>

[See all contributors](https://github.com/strongloop/loopback-next/graphs/contributors)

# Contributing

- [Guidelines](https://github.com/strongloop/loopback-next/wiki/Contribution-guidelines)
- [Join the team](https://github.com/strongloop/loopback-next/wiki/Join-the-team)

# License

[MIT](https://github.com/strongloop/loopback-next/blob/master/LICENSE)
