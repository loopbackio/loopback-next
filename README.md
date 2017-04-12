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

# License

[MIT](https://github.com/strongloop/loopback-next/blob/master/LICENSE)
