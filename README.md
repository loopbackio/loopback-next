# loopback-next

[![Gitter](https://img.shields.io/gitter/room/nwjs/nw.js.svg)](https://gitter.im/strongloop/loopback)

LoopBack makes it easy to build modern applications that require complex integrations.

- Fast, small, extensible core
- Generate real APIs with a single command
- Define your data and endpoints with OpenAPI
- No maintenance of generated code

## How to use this `loopback-next` repo

### Ideas / Requests

 - Ideas are great (code is better ;) - see below on how to get started)
 - Try and find an existing loopback issue before opening a new discussion

### Committing

 - [Create an issue](https://github.com/strongloop/loopback-next/issues) to discuss your refactor / feature / etc. Mention [@ritch](http://github.com/ritch)
 - Make PRs (make them small, get them reviewed)
 - All code should have tests and documentation! Details TBD
 - All code must conform to automated linting

## Package management

### Shared dependencies

Regular NPM install at the package root:

```
npm i -D mocha
```

You DO NOT need to install in the submodules as Lerna figures it out for you.

## Testing

### Usage

```shell
git clone https://github.com/strongloop/loopback-next.git
cd loopback-next
npm install
lerna bootstrap
npm run test
```

### Running tests

Run all tests (unit, then integration, then acceptance) for all packages:

```shell
lerna run test
```

Run acceptance tests for all packages:

```shell
lerna run acceptance
```

Run acceptance tests for one package:

```shell
lerna run acceptance --scope loopback
```

Replace `acceptance` with `integration` or `unit` accordingly.

# License

[MIT](https://github.com/strongloop/loopback-next/blob/master/LICENSE)
