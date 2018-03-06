# Monorepo overview

The [loopback-next](https://github.com/strongloop/loopback-next) repository uses [lerna](https://lernajs.io/) to manage multiple packages for LoopBack 4.

<!-- PLEASE KEEP THE TABLE ROWS SORTED ALPHABETICALLY BY PACKAGE NAME-->

| Package                                                   | npm                           | Description               |
|-----------------------------------------------------------|-------------------------------|---------------------------|
|[authentication](packages/authentication)                  |@loopback/authentication        | A component for authentication support |
|[boot](packages/boot)                                      |@loopback/boot                  | Convention based Bootstrapper and Booters |
|[build](packages/build)                                    |@loopback/build                 | A set of common scripts and default configurations to build LoopBack 4 or other TypeScript modules |
|[cli](packages/cli)                                        |@loopback/cli                   | CLI for LoopBack 4            |
|[context](packages/context)                                |@loopback/context               | Facilities to manage artifacts and their dependencies in your Node.js applications. The module exposes TypeScript/JavaScript APIs and decorators to register artifacts, declare dependencies, and resolve artifacts by keys. It also serves as an IoC container to support dependency injection. |
|[core](packages/core)                                      |@loopback/core                  | Define and implement core constructs such as Application and Component |
|[example-getting-started](packages/example-getting-started)| _(private)_                    | A basic tutorial for getting started with Loopback 4 |
|[example-hello-world](packages/example-hello-world)        | _(private)_                    | A simple hello-world application using LoopBack 4 |
|[example-log-extension](packages/example-log-extension)    | _(private)_                    | An example showing how to write a complex log extension for LoopBack 4 |
|[example-rpc-server](packages/example-rpc-server)          | _(private)_                    | An example RPC server and application to demonstrate the creation of your own custom server |
|[metadata](packages/metadata)                              |@loopback/metadata              | Utilities to help developers implement TypeScript decorators, define/merge metadata, and inspect metadata |
|[openapi-spec-builder](packages/openapi-spec-builder)      |@loopback/openapi-spec-builder  | Builders to create OpenAPI (Swagger) specification documents in tests |
|[openapi-v3](packages/openapi-v3)                          |@loopback/openapi-v3            | Decorators that annotate LoopBack artifacts with OpenAPI v3 metadata and utilities that transform LoopBack metadata to OpenAPI v3 specifications|
|[openapi-v3-types](packages/openapi-v3-types)              |@loopback/openapi-v3-types      | TypeScript type definitions for OpenAPI Specifications |
|[repository-json-schema](packages/repository-json-schema)  |@loopback/repository-json-schema| Convert a TypeScript class/model to a JSON Schema |
|[repository](packages/repository)                          |@loopback/repository            | Define and implement a common set of interfaces for interacting with databases|
|[rest](packages/rest)                                      |@loopback/rest                  | Expose controllers as  REST endpoints and route REST API requests to controller methods |
|[testlab](packages/testlab)                                |@loopback/testlib               | A collection of test utilities we use to write LoopBack tests |

We use npm scripts declared in [package.json](package.json) to work with the monorepo managed by lerna. See [Developing LoopBack](./docs/DEVELOPING.md) for more details.

