# @loopback/openapi-v3-types

TypeScript type definitions for OpenAPI Spec/Swagger documents.

## Overview

TypeScript definitions describing the schema of OpenAPI/Swagger documents,
including LoopBack-specific extensions.

## Installation

```sh
npm install --save @loopback/openapi-v3-types
```

## Basic use

Use `OpenApiSpec` type in your function accepting an OpenAPI document:

```ts
import {OpenApiSpec} from '@loopback/openapi-v3-types';

export function validateSpec(spec: OpenApiSpec) {
  // ...
}
```

IDEs like Visual Studio Code will offer auto-completion for spec properties when
constructing a spec argument value.

## Related resources

See <https://www.openapis.org/> and
[version 3.0.0](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md)
of OpenAPI Specification. For the types missing in this package, they are
exported from <https://www.npmjs.com/package/openapi3-ts>

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
