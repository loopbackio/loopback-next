# @loopback/repository-json-schema

Convert a TypeScript class/model to a JSON Schema for users, leveraging LoopBack4's decorators, metadata, and reflection system.

## Overview

This package provides modules to easily convert LoopBack4 models that have been decorated with `@model` and `@property` to a matching JSON Schema Definition.

## Installation

```shell
$ npm install --save @loopback/repository-json-schema
```

## Basic use

```ts
import {modelToJsonDef} from '@loopback/repository-json-schema';
import {model, property} from '@loopback/repository';

@model()
MyModel {
  @property() name: string;
}

const jsonDef = modelToJsonDef(MyModel);
```

The value of `jsonDef` will be:

```json
{
  "properties": {
    "name": {
      "type": "string"
    }
  }
}
```

## Contributions

IBM/StrongLoop is an active supporter of open source and welcomes contributions to our projects as well as those of the Node.js community in general. For more information on how to contribute please refer to the [Contribution Guide](https://loopback.io/doc/en/contrib/index.html).

# Tests

run `npm test` from the root folder.

# Contributors

See [all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

# License

MIT
