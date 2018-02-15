# loopback-next

The [loopback-next](https://github.com/strongloop/loopback-next) repository uses
[lerna](https://lernajs.io/) to manage multiple packages for LoopBack 4.

## Packages

| Package                                                   | npm                           | Description               |
|-----------------------------------------------------------|-------------------------------|---------------------------|
|[build](packages/build)                                    |@loopback/build                 | A set of common scripts and default configurations to build LoopBack 4 or other TypeScript modules |
|[testlab](packages/testlab)                                |@loopback/testlib               | A collection of test utilities we use to write LoopBack tests |
|[cli](packages/cli)                                        |@loopback/cli                   | CLI for LoopBack 4            |
|[metadata](packages/metadata)                              |@loopback/metadata              | Utilities to help developers implement TypeScript decorators, define/merge metadata, and inspect metadata |
|[context](packages/context)                                |@loopback/context               | Facilities to manage artifacts and their dependencies in your Node.js applications. The module exposes TypeScript/JavaScript APIs and decorators to register artifacts, declare dependencies, and resolve artifacts by keys. It also serves as an IoC container to support dependency injection. |
|[core](packages/core)                                      |@loopback/core                  | Define and implement core constructs such as Application and Component |
|[boot](packages/boot)                                      |@loopback/boot                  | Convention based Bootstrapper and Booters |
|[openapi-spec](packages/openapi-spec)                      |@loopback/openapi-spec          | TypeScript type definitions for OpenAPI Spec/Swagger documents |
|[openapi-spec-builder](packages/openapi-spec-builder)      |@loopback/openapi-spec-builder  | Builders to create OpenAPI (Swagger) specification documents in tests |
|[openapi-v2](packages/openapi-v2)                          |@loopback/openapi-v2            | Decorators that annotate LoopBack artifacts with OpenAPI v2 (Swagger) metadata and utilities that transform LoopBack metadata to OpenAPI v2 (Swagger) specifications|
|[openapi-v3-types](packages/openapi-v3-types)              |@loopback/openapi-v3-types      | TypeScript type definitions for OpenAPI Specifications |
|[rest](packages/rest)                                      |@loopback/rest                  | Expose controllers as  REST endpoints and route REST API requests to controller methods |
|[repository](packages/repository)                          |@loopback/repository            | Define and implement a common set of interfaces for interacting with databases|
|[repository-json-schema](packages/repository-json-schema)  |@loopback/repository-json-schema| Convert a TypeScript class/model to a JSON Schema |
|[authentication](packages/authentication)                  |@loopback/authentication        | A component for authentication support |
|[example-hello-world](packages/example-hello-world)        |                                | A simple hello-world application using LoopBack 4 |
|[example-getting-started](packages/example-getting-started)|                                | A basic tutorial for getting started with Loopback 4 |
|[example-log-extension](packages/example-log-extension)    |                                | An example showing how to write a complex log extension for LoopBack 4 |
|[example-rpc-server](packages/example-rpc-server)          |                                | An example RPC server and application to demonstrate the creation of your own custom server |

## Working with the repository

We use npm scripts declared in [package.json](package.json) to work with the
monorepo managed by lerna.

### Set up the project
```sh
git clone https://github.com/strongloop/loopback-next.git
cd loopback-next
npm run bootstrap
```

### Common tasks

| Task             | Command               | Description |
|------------------|-----------------------|-------------|
|Bootstrap packages|`npm run bootstrap`    |Install npm dependencies for all packages and create symbolic links for intra-dependencies. It's required for the initial setup or the list of packages is changed |
|Build packages    |`npm run build`        |Transpile TypeScript files into JavaScript |
|Run tests         |`npm test`             |Clean, build, run mocha tests, and perform lint checks |
|Fix lint issues   |`npm run lint:fix`     |Fix lint issues, including tslint rules and prettier formatting |

### Build a release

When we are ready to tag and publish a release, run the following commands:
```sh
cd loopback-next
git checkout master
git pull
npm run release
```

The `release` script will automatically perform the tasks for all packages:

- Clean up `node_modules`
- Install/link dependencies
- Transpile TypeScript files into JavaScript
- Run mocha tests
- Check lint (tslint and prettier) issues

If all steps are successful, it prompts you to publish packages into npm repository.

### Add a new package

To add a new package, create a folder in [`packages`](packages) as the root directory of your module. For example,
```sh
cd loopback-next/packages
mkdir <a-new-package>
```
The package follows the node/npm module layout. You can use `npm init` or `lb4 extension` command to scaffold the module, copy/paste from an existing package, or manually add files including `package.json`.

We have some configuration files at the top level (**loopback-next/**):

- `.gitignore`
- `.prettierignore`
- `.nycrc.yml`

For consistency across all packages, do not add them at package level unless specific customization is needed.

Please also register the new package in the following files:
- Add the new package and your name as its owner in [CODEOWNERS](CODEOWNERS). 
- Add the new module in the `packages` list in [MONOREPO#packages](MONOREPO#packages).

By default, npm publishes scoped packages with private access. There are two options to make a new scoped package with public access.

Add the following section to `package.json`:
```json
  "publishConfig": {
    "access": "public"
  },
```
Explicitly publish the package with --access=public.
```sh
cd packages/<a-new-package>
npm publish --access=public
```

Make sure you add LICENSE file properly and all the files are began with copyrights declaration.