# loopback-next

[![Gitter](https://img.shields.io/gitter/room/nwjs/nw.js.svg)](https://gitter.im/strongloop/loopback) [![Travis Build Status](https://img.shields.io/travis/rust-lang/rust.svg)](https://travis-ci.org/strongloop/loopback-next) [![AppVeyor Build status](https://ci.appveyor.com/api/projects/status/3v1qmusv168a0kb0/branch/master?svg=true)](https://ci.appveyor.com/project/bajtos/loopback-next/branch/master) [![Coverage Status](https://coveralls.io/repos/github/strongloop/loopback-next/badge.svg?branch=master)](https://coveralls.io/github/strongloop/loopback-next?branch=master)

LoopBack makes it easy to build modern applications that require complex integrations.

- Fast, small, powerful, extensible core
- Generate real APIs with a single command
- Define your data and endpoints with OpenAPI
- No maintenance of generated code

# Status: ALPHA

LoopBack Next is a work in progress, the public API is frequently changed in
backwards-incompatible ways. See [Upcoming-Releases on wiki](https://github.com/strongloop/loopback-next/wiki/Upcoming-Releases)
for more details.

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
> `tsconfig.json` if you're using a TypeScript project. See [Installation
> ](http://loopback.io/doc/en/lb4/Installation.html) for
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

- [API documentation](http://apidocs.loopback.io/)
- [FAQ](http://loopback.io/doc/en/lb4/FAQ.html)
- [LoopBack 3 vs LoopBack 4](http://loopback.io/doc/en/lb4/Migration-guide.html)
- [Tutorials and examples](http://loopback.io/doc/en/lb4/Examples-and-tutorials.html)

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
