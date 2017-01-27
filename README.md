# loopback-next

# About

This is the next chapter in the LoopBack story. For practicality we are using a single repository for major refactoring of components. At some point this will be broken out back into smaller modules.

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

## Tests

Run tests (black-box and white-box) for all packages:

```
lerna run test
```

Run black-box tests for all packages:

```
lerna run black-box
```

Run black-box tests for one package:

```
lerna run black-box --scope loopback
```

Replace `black-box` with `white-box` accordingly.
