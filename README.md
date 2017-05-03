# loopback-next

[![Gitter](https://img.shields.io/gitter/room/nwjs/nw.js.svg)](https://gitter.im/strongloop/loopback) [![Build Status](https://img.shields.io/travis/rust-lang/rust.svg)](https://travis-ci.org/strongloop/loopback-next)

LoopBack makes it easy to build modern applications that require complex integrations.

- Fast, small, powerful, extensible core
- Generate real APIs with a single command
- Define your data and endpoints with OpenAPI
- No maintenance of generated code

# Installation

Make sure you have the following installed:

- [Node.js](https://nodejs.org/en/download/) >= 7.0.0
- [TypeScript](https://www.typescriptlang.org/index.html#download-links) >= 2.0.0 `npm i -g typescript`
- [TypeScript Node](https://github.com/TypeStrong/ts-node#installation) >= 3.0.0 `npm i -g ts-node`

Then in your Node.js project root, run:

```shell
npm install -S @loopback/core
```

> Make sure you set `"target": "es6"` in your compiler options in your
> `tsconfig.json` if you're using a TypeScript project. See the [installation
> wiki](https://github.com/strongloop/loopback-next/wiki/installation) for
> detailed information.

# Example

A basic controller:

```ts
export class UserController {
  async getUserByName(username: string): Promise<UserResponse> {
    const users = new UserRepository();
    const user = await users.findOne({where: {username: username}});
    if (!user) {
      throw createHttpError.NotFound(`User ${username} not found.`);
    }
    return new UserResponse(user);
  }
}
```

See [loopback-next-example](https://github.com/strongloop/loopback-next-example) for more.

# Documentation

- [API documentation](https://github.com/strongloop/loopback-next/wiki/API-documentation)
- [FAQ](https://github.com/strongloop/loopback-next/wiki/FAQ)
- [LoopBack 3 vs LoopBack 4](https://github.com/strongloop/loopback-next/wiki/LoopBack-3-vs-LoopBack-4)
- [Official documentation](https://github.com/strongloop/loopback-next/wiki)
- [Tutorials and examples](https://github.com/strongloop/loopback-next/wiki/Tutorials-and-examples)

# Team

Ritchie Martori|Raymond Feng|Miroslav Bajtos|Rand McKinney|Simon Ho
:-:|:-:|:-:|:-:|:-:
[<img src="https://avatars2.githubusercontent.com/u/462228?v=3&s=60">](http://github.com/ritch)|[<img src="https://avatars0.githubusercontent.com/u/540892?v=3&s=60">](http://github.com/raymondfeng)|[<img src="https://avatars2.githubusercontent.com/u/1140553?v=3&s=60">](http://github.com/bajtos)|[<img src="https://avatars2.githubusercontent.com/u/2925364?v=3&s=60">](http://github.com/crandmck)|[<img src="https://avatars1.githubusercontent.com/u/1617364?v=3&s=60">](http://github.com/superkhau)

See [all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

# Contributing

- [Guidelines](https://github.com/strongloop/loopback-next/wiki/Contributing#guidelines)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

# License

MIT
