# @loopback/repository-json-schema

Convert a TypeScript class/model to a JSON Schema for users, leveraging
LoopBack4's decorators, metadata, and reflection system.

## Overview

This package provides modules to easily convert LoopBack4 models that have been
decorated with `@model` and `@property` to a matching JSON Schema Definition.

## Installation

```shell
$ npm install --save @loopback/repository-json-schema
```

## Basic use

```ts
import {getJsonSchema} from '@loopback/repository-json-schema';
import {model, property} from '@loopback/repository';

@model()
class MyModel {
  @property()
  name: string;
}

const jsonSchema = getJsonSchema(MyModel);
```

The value of `jsonSchema` will be:

```json
{
  "title": "MyModel",
  "properties": {
    "name": {
      "type": "string"
    }
  }
}
```

## Contributions

- [Guidelines](https://github.com/loopbackio/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/loopbackio/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/loopbackio/loopback-next/graphs/contributors).

## License

MIT
