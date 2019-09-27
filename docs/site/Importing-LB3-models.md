---
lang: en
title: 'Importing models from LoopBack 3 projects'
keywords: LoopBack 4.0, Migration
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Importing-LB3-models.html
---

## Synopsis

To simplify migration from LoopBack 3, LoopBack 4 provides a CLI tool to import
LoopBack 3 models into your LoopBack 4 project.

{% include warning.html content="
This command is experimental and not feature-complete yet.
See the list of known limitations below.
" %}

## Overview

Import one or more models from your LB 3.x application by running
`lb4 import-lb3-models` command.

### Arguments

`lb3app`: Path to the directory containing your LoopBack 3.x application.

{% include important.html content="
The generator loads the application via `require()`, it does not
support applications that are unable to boot (throw errors at startup).
" %}

### Options

`outDir`: Directory where to write the generated source file. Default:
`src/models`

## Known limitations

{% include note.html content="
Please up-vote the tracking GitHub issue for scenarios that are important to
your project. It will help us to better prioritize which limitations to remove
first.
" %}

### Connector-specific metadata in property definitions is not imported

_The tracking GitHub issue:
[loopback-next#3810](https://github.com/strongloop/loopback-next/issues/3810)_

Workaround: Add this metadata manually to the generated file.

### Nested properties are not upgraded

_The tracking GitHub issue:
[loopback-next#3811](https://github.com/strongloop/loopback-next/issues/3811)_

When a property is defined with a complex object type, the nested property
definitions are not converted from LB3 to LB4 format.

Workaround: Fix the generated definition manually.

### Model relations are not imported

_The tracking GitHub issue:
[loopback-next#3812](https://github.com/strongloop/loopback-next/issues/3812)_

Workaround: define relational metadata & navigational properties manually.

### Models inheriting from custom base class

_The tracking GitHub issue:
[loopback-next#3813](https://github.com/strongloop/loopback-next/issues/3813)_

Models inheriting from application-specific models (including LB3 built-in
models like `User`) cannot be imported yet.

Workaround:

1. Modify your LB3 model to inherit from `Model`, `PersistedModel` or
   `KeyValueModel`.

2. Import the model to LB4

3. Update the imported model to inherit for the desired application-specific
   model.

### MongoDB's `ObjectID` type

The tracking GitHub issue:
[loopback-next#3814](https://github.com/strongloop/loopback-next/issues/3814).

For models attached to MongoDB datasource, the imported LB4 model contains
incorrect definition of the primary key property of `ObjectID` type.

As a workaround, you can change the property definition from:

```ts
@property({
  type: ObjectID;
})
id: ObjectID;
```

to:

```ts
@property({
  type: 'string',
  mongodb: {dataType: 'ObjectID'}
})
id: string;
```

### Some settings cannot be imported

The following fields from model settings are not supported by LoopBack 4 and
therefore ignored during import:

- `acls`
- `methods`
- `mixins`
- `validations`
