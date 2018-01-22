# @loopback/openapi-spec

TypeScript type definitions for OpenAPI Spec/Swagger documents.

## Overview

TypeScript definitions describing the schema of OpenAPI/Swagger documents,
including LoopBack-specific extensions.

## Installation

```
$ npm install --save @loopback/openapi-spec
```

## Basic use

Use `OpenApiSpec` type in your function accepting a Swagger/OpenAPI document:

```ts
import {OpenApiSpec} from '@loopback/openapi-spec';

export function validateSpec(spec: OpenApiSpec) {
  // ...
}
```

IDEs like Visual Studio Code will offer auto-completion for spec properties
when constructing a spec argument value.

## Related resources

See https://www.openapis.org/ and [version 2.0](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md)
of OpenAPI Specification.

## Contributions

IBM/StrongLoop is an active supporter of open source and welcomes contributions to our projects as well as those of the Node.js community in general. For more information on how to contribute please refer to the [Contribution Guide](https://loopback.io/doc/en/contrib/index.html).

# Tests

run `npm test` from the root folder.

# Contributors

See [all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

# License

MIT

# One repo vs multiple repo

## One repo

### Pros

- easy to extract common suger interfaces
- less packages to maintain, clearier layout to manage different versions
- if we only support one version, export types from one package, no need to update each dependant

# Items to change

- path related repos --> rest & openapi-v2 & ?
- components.schema related repo --> repository/decorators/metadata?
- update path decorator's KEY
- explain more in openapi-v2's readme
- openapi-spec-builder
  - 
- verification --> testlab
- shall we merge openapi-spec-builder and openapi-v2?
- fix the inconsistency caused by basePath --> servers
  - check port, host

#Questions

- default server: set default port and host?
  - Yes. default is required
  - wrap 3000 with double quotes?

# Type validation repo

https://github.com/hanlindev/interface-validator