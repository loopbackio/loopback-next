# @loopback/build

This module contains a set of common scripts and default configurations to build
LoopBack 4 or other TypeScript modules, including:

- lb-tsc: Use
  [`tsc`](https://www.typescriptlang.org/docs/handbook/compiler-options.html) to
  compile typescript files
- lb-eslint: Run [`eslint`](https://typescript-eslint.io/)
- lb-tslint: Run [`tslint`](https://github.com/palantir/tslint)
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
