# @loopback/build

The module contains a set of common scripts and default configurations to
build LoopBack 4 modules, including:

- lb-tsc: Use `tsc` to compile typescript files
- lb-dist: Detect the correct distribution target: `dist` => ES2017, `dist6` => ES2015
- lb-tslint: Run `tslint` with `<project>/tslint.build.json`
- lb-prettier: Run `prettier`

# Usage

To use `@loopback/build` for your package:

1. Run the following command to add `@loopback/build` as a dev dependency.

`npm i @loopback/build --save-dev`

2. Configure your project package.json as follows:
```json
"scripts": {
    "acceptance": "lb-dist mocha --opts ../../test/mocha.opts 'DIST/test/acceptance/**/*.js'",
    "build": "npm run build:dist && npm run build:dist6",
    "build:current": "lb-tsc",
    "build:dist": "lb-tsc es2017",
    "build:dist6": "lb-tsc es2015",
    "build:apidocs": "lb-apidocs",
    "tslint": "lb-tslint",
    "tslint:fix": "npm run tslint -- --fix",
    "prettier:cli": "lb-prettier \"**/*.ts\"",
    "prettier:check": "npm run prettier:cli -- -l",
    "prettier:fix": "npm run prettier:cli -- --write",
    "clean": "rm -rf loopback-grpc*.tgz dist*",
    "prepublish": "npm run build && npm run build:apidocs",
    "pretest": "npm run build:current",
    "integration": "lb-dist mocha --opts ../../test/mocha.opts 'DIST/test/integration/**/*.js'",
    "test": "lb-dist mocha --opts ../../test/mocha.opts 'DIST/test/unit/**/*.js' 'DIST/test/integration/**/*.js' 'DIST/test/acceptance/**/*.js'",
    "unit": "lb-dist mocha --opts ../../test/mocha.opts 'DIST/test/unit/**/*.js'",
    "verify": "npm pack && tar xf loopback-grpc*.tgz && tree package && npm run clean"
  },
```

3. Run builds

```
npm run build
```
# License

MIT
