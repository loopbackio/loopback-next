# @loopback/build

This module contains a set of common scripts and default configurations to build
LoopBack 4 or other TypeScript modules, including:

- lb-tsc: Use
  [`tsc`](https://www.typescriptlang.org/docs/handbook/compiler-options.html) to
  compile typescript files
- lb-tslint: Run [`tslint`](https://github.com/palantir/tslint)
- lb-prettier: Run [`prettier`](https://github.com/prettier/prettier)
- lb-mocha: Run [`mocha`](https://mochajs.org/) to execute test cases
- lb-nyc: Run [`nyc`](https://github.com/istanbuljs/nyc)
- lb-dist: Detect the correct distribution target: `dist` => ES2017, `dist6` =>
  ES2015. The command is deprecated as `lb-mocha` detects the distribution
  target now.

These scripts first try to locate the CLI from target project dependencies and
fall back to bundled ones in `@loopback/build`.

## Basic use

To use `@loopback/build` for your package:

1.  Run the following command to add `@loopback/build` as a dev dependency.

`npm i @loopback/build --save-dev`

2.  Configure your project package.json as follows:

```json
"scripts": {
    "build": "lb-tsc",
    "build:watch": "lb-tsc --watch",
    "clean": "lb-clean",
    "lint": "npm run prettier:check && npm run tslint",
    "lint:fix": "npm run prettier:fix && npm run tslint:fix",
    "prettier:cli": "lb-prettier \"**/*.ts\" \"**/*.js\"",
    "prettier:check": "npm run prettier:cli -- -l",
    "prettier:fix": "npm run prettier:cli -- --write",
    "tslint": "lb-tslint",
    "tslint:fix": "npm run tslint -- --fix",
    "pretest": "npm run clean && npm run build",
    "test": "lb-mocha \"dist/test\"",
    "posttest": "npm run lint",
    "start": "npm run build && node .",
    "prepublishOnly": "npm run test"
  },
```

Please remember to replace `your-module-name` with the name of your module.

Now you run the scripts, such as:

- `npm run build` - Compile TypeScript files and copy resources (non `.ts`
  files) to outDir
- `npm test` - Run all mocha tests
- `npm run lint` - Run `tslint` and `prettier` on source files

3.  Override default configurations in your project

- lb-tsc

  By default, `lb-tsc` searches your project's root directory for
  `tsconfig.build.json` then `tsconfig.json`. If neither of them exists, a
  `tsconfig.json` will be created to extend from
  `@loopback/build/config/tsconfig.common.json`.

  To customize the configuration:

  - Create `tsconfig.build.json` or `tsconfig.json` in your project's root
    directory

    ```json
    {
      "$schema": "http://json.schemastore.org/tsconfig",
      "extends": "@loopback/build/config/tsconfig.common.json",
      "compilerOptions": {
        "rootDir": "."
      },
      "include": ["src", "test"]
    }
    ```

  - Set options explicity for the script

    ```sh
    lb-tsc -p tsconfig.json --target es2017 --outDir dist
    ```

    For more information, see
    <https://www.typescriptlang.org/docs/handbook/compiler-options.html>.

  - The following un-official compiler options are available:

    | Option             | Description                                                                                       |
    | ------------------ | ------------------------------------------------------------------------------------------------- |
    | `--copy-resources` | Copy all non-typescript files from `src` and `test` to `outDir`, preserving their relative paths. |

- lb-tslint

  By default, `lb-tslint` searches your project's root directory for
  `tslint.build.json` then `tslint.json`. If neither of them exists, it falls
  back to `./node_modules/@loopback/build/config/tslint.common.json`.

  `lb-tslint` also depends on `tsconfig.build.json` or `tsconfig.json` to
  reference the project.

  **NOTE:** Our recommended configuration of tslint rules is maintained inside
  the package `@loopback/tslint-config`. We strongly recommend users to create
  their own tslint configuration files inheriting from `@loopback/tslint-config`
  instead of relying on the defaults provided by `@loopback/build`.

  To customize the configuration:

  - Create `tslint.build.json` in your project's root directory, for example:

    ```json
    {
      "$schema": "http://json.schemastore.org/tslint",
      "extends": ["@loopback/eslint-config/tslint.build.json"],
      // This configuration files enabled rules which require type checking
      // and therefore cannot be run by Visual Studio Code TSLint extension
      // See https://github.com/Microsoft/vscode-tslint/issues/70
      "rules": {
        // These rules find errors related to TypeScript features.
        // These rules catch common errors in JS programming or otherwise
        // confusing constructs that are prone to producing bugs.

        "await-promise": true,
        "no-floating-promises": true,
        "no-void-expression": [true, "ignore-arrow-function-shorthand"]
      }
    }
    ```

- Set options explicitly for the script

  ```sh
  lb-tslint -c tslint.json -p tsconfig.json
  ```

  For more information, see <https://palantir.github.io/tslint/usage/cli/>.

4.  Run builds

```sh
npm run build
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
