# @loopback/build

This module contains a set of common scripts and default configurations to build
LoopBack 4 or other TypeScript modules, including:

- lb-tsc: Use
  [`tsc`](https://www.typescriptlang.org/docs/handbook/compiler-options.html) to
  compile typescript files
- lb-eslint: Run [`eslint`](https://typescript-eslint.io/)
- lb-prettier: Run [`prettier`](https://github.com/prettier/prettier)
- lb-mocha: Run [`mocha`](https://mochajs.org/) to execute test cases
- lb-nyc: Run [`nyc`](https://github.com/istanbuljs/nyc)

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
    "lint": "npm run prettier:check && npm run eslint",
    "lint:fix": "npm run prettier:fix && npm run eslint:fix",
    "prettier:cli": "lb-prettier \"**/*.ts\" \"**/*.js\"",
    "prettier:check": "npm run prettier:cli -- -l",
    "prettier:fix": "npm run prettier:cli -- --write",
    "eslint": "lb-eslint --report-unused-disable-directives .",
    "eslint:fix": "npm run eslint -- --fix",
    "pretest": "npm run clean && npm run build",
    "test": "lb-mocha \"dist/__tests__\"",
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
- `npm run lint` - Run `eslint` and `prettier` on source files

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
        "outDir": "dist",
        "rootDir": "src"
      },
      "include": ["src"]
    }
    ```

  - Set options explicitly for the script

    ```sh
    lb-tsc -p tsconfig.json --target es2017 --outDir dist
    ```

    For more information, see
    <https://www.typescriptlang.org/docs/handbook/compiler-options.html>.

  - The following un-official compiler options are available:

    | Option             | Description                                                                                       |
    | ------------------ | ------------------------------------------------------------------------------------------------- |
    | `--copy-resources` | Copy all non-typescript files from `src` and `test` to `outDir`, preserving their relative paths. |

  - Using [`ttypescript`](https://github.com/cevek/ttypescript)

    ### Stability: ⚠️Experimental⚠️

    If you would like to use `ttypescript` and its available plugins, you can
    substitute `lb-tsc` with `lb-ttsc`, or pass the option
    `lb-tsc --use-ttypescript`. If `ttypescript` is not installed, the default
    TypeScript compiler `tsc` will be used instead.

4.  Run builds

```sh
npm run build
```

5.  Run code coverage reports

- `lb-nyc`

  `lb-nyc` is a simple wrapper for [`nyc`](https://github.com/istanbuljs/nyc).

  To customize the configuration:

  - Create `.nycrc` in your project's root directory

    ```json
    {
      "include": ["dist"],
      "exclude": ["dist/__tests__/"],
      "extension": [".js", ".ts"],
      "reporter": ["text", "html"],
      "exclude-after-remap": false
    }
    ```

  - Update your `package.json` scripts:

    ```json
    "precoverage": "npm test",
    "coverage": "open coverage/index.html",
    "coverage:ci": "lb-nyc report --reporter=text-lcov | coveralls",
    "test": "lb-nyc npm run mocha",
    "test:ci": "lb-nyc npm run mocha"
    ```

    `coverage:ci` sets up integration with [Coveralls](https://coveralls.io/).

## A note on console logs printed by tests

We consider (console) logging from tests as a bad practice, because such logs
usually clutter the test output and make it difficult to distinguish legitimate
error messages from the noise.

By default, `lb-mocha` detects when the tests and/or the application tested have
printed console logs and fails the test run with the following message:

```
=== ATTENTION - INVALID USAGE OF CONSOLE LOGS DETECTED ===
```

If you need more information about behavior in the test, then the first choice
should be to use a better or more descriptive error assertion. If that's not
possible, then use debug statements to print additional information when
explicitly requested.

A typical situation is that a test is sending an HTTP request and the server
responds with an error code as expected. However, because the server is
configured to log failed requests, it will print a log also for requests where
the failure was expected and intentional. The solution is to configure your REST
server to suppress error messages for that specific error code only. Our
`@loopback/testlab` module is providing a helper
[`createUnexpectedHttpErrorLogger`](https://github.com/loopbackio/loopback-next/tree/master/packages/testlab#createUnexpectedHttpErrorLogger)
that makes this task super easy.

Alternatively, it's also possible to disable detection of console logs by
calling `lb-mocha` with `--allow-console-logs` argument.

## Contributions

- [Guidelines](https://github.com/loopbackio/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/loopbackio/loopback-next/issues/110)

## Tests

run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/loopbackio/loopback-next/graphs/contributors).

## License

MIT
