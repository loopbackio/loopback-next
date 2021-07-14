# @loopback/monorepo

This module contains a set of common scripts to maintain a
[lerna](https://github.com/lerna/lerna) monorepo.

- `script-util`: common utility functions for `lerna`
- `check-package-locks`: check if `package-lock.json` files has local packages.
- `rebuild-package-locks`: rebuild `package-lock.json` files for all packages or
  packages matching given scopes.
- `run-lerna`: run `lerna` command with `LERNA_ROOT_PATH` environment variable
  set to the root path of the monorepo
- `config-lerna-scopes`: return a list of scope names for conventional commits.
- `update-package-deps`: update package dependencies to match versions of local
  packages.
- `update-package-json`: update `package.json` files for all packages based on
  metadata from the root `package.json` for the monorepo
- `update-ts-project-refs`: update `tsconfig.json` with TypeScript project
  references based on the dependency graph.

## Basic use

To use `@loopback/monorepo` for your lerna monorepo, run the following command
to add `@loopback/monorepo` as a dev dependency to the root project.

```sh
npm i @loopback/monorepo --save-dev
```

The following commands are exposed by `@loopback/monorepo`.

- `lb-run-lerna`: run `lerna` command with `LERNA_ROOT_PATH` environment
  variable set to the root path of the monorepo

- `lb-check-package-locks`: check if `package-lock.json` files has local
  packages.

- `lb-rebuild-package-locks`: rebuild `package-lock.json` files for all packages
  or packages matching given scopes.

- `lb-update-package-deps`: update package dependencies to match versions of
  local packages.

- `lb-update-package-json`: update `package.json` files for all packages based
  on metadata from the root `package.json` for the monorepo.

- `lb-update-ts-project-refs`: update `tsconfig.json` with TypeScript project
  references based on the dependency graph.

These commands can be invoked using `npx`:

```sh
npx lb-update-ts-project-refs
npx lb-rebuild-package-locks
```

The `--dry-run` option can be used to preview changes without applying them.

```sh
npx lb-update-ts-project-refs --dry-run
```

To access such scripts programmatically:

```js
const {
  checkPackageLocks,
  configLernaScopes,
  runLerna,
  updatePackageDeps,
  updatePackageJson,
  updateTsProjectRefs,
  getPackages,
  loadLernaRepo,
  runMain,
} = require('@loopback/monorepo');
```

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
