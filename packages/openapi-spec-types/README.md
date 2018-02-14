# @loopback/openapi-spec

TypeScript type definitions for OpenAPI Spec/Swagger documents.

## Overview

TypeScript definitions describing the schema of OpenAPI/Swagger documents,
including LoopBack-specific extensions.

_@jannyHou: will add more doc here to specify the version of types after we decide how to support new versions/keep old versions_

## Installation

```
$ npm install --save @loopback/openapi-spec-types
```

## Basic use

Use `OpenApiSpec` type in your function accepting an OpenAPI document:

```ts
import {OpenApiSpec} from '@loopback/openapi-spec-types';

export function validateSpec(spec: OpenApiSpec) {
  // ...
}
```

IDEs like Visual Studio Code will offer auto-completion for spec properties
when constructing a spec argument value.

## Related resources

See https://www.openapis.org/ and [version 3.0.0](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md)
of OpenAPI Specification.

## Contributions

IBM/StrongLoop is an active supporter of open source and welcomes contributions to our projects as well as those of the Node.js community in general. For more information on how to contribute please refer to the [Contribution Guide](https://loopback.io/doc/en/contrib/index.html).

# Tests

run `npm test` from the root folder.

# Contributors

See [all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

# License

MIT

# Question

Do we want multiple repos for types?

option 1
- openapi-spec-types
- swagger-spec-types

option 2
- openapi-spec-types
  - /v2
  - /v3
  

Benefit of single repo:

* easy to extract common suger interfaces
* less packages to maintain, clear layout to manage different versions
* if we only support one version, export types from one package, no need to update each dependant
