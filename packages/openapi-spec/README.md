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
