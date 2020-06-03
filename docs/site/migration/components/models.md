---
lang: en
title: 'Migrating components contributing Models'
keywords:
  LoopBack 4, LoopBack 3, Node.js, TypeScript, OpenAPI, Migration, Extensions,
  Components, Models
sidebar: lb4_sidebar
permalink: /doc/en/lb4/migration-extensions-models.html
---

Please review the content in [Migrating models](../models/overview.md) first.
Going forward, we assume that you are already familiar with the differences
between LoopBack 3 Models and LoopBack 4 Entities & Repositories, and understand
how to migrate model-related functionality from a LoopBack 3 application to
LoopBack 4.

## Import LoopBack 3 models

The first step is to import LoopBack 3 model definitions into your LoopBack 4
component. This will convert LB3 model JSON files into LB4 TypeScript classes,
as explained in
[Import Model definition](../models/core.md#import-model-definition) and
[Importing models from LoopBack 3 projects](../../Importing-LB3-models.md).

1. Create a small LB3 app that is using your component.

2. In your LB4 extension project, run `lb4 import-lb3-models <path-to-lb3-app>`
   to import model(s) contributed by the component from the LB3 app you created
   in the previous step. Change the base class of the imported model(s) from
   `Entity` to `Model` if needed.

## Migrate behavior-less models

Sometimes, a LoopBack 3 model does not provide any behavior, it is just
describing the shape of data (e.g. data fields in a push notification object).
Such models can be converted to LoopBack 4 models as follows:

1. Import the LoopBack 3 model to your LoopBack 4 project as explained in
   [Import LoopBack 3 models](#import-loopback-3-models).

2. Ensure that your component's main index file exports all models:

   ```ts
   // src/index.ts
   export * from './models';
   ```

3. Update your documentation to instruct users to import the models directly
   from the extension, instead of relying on loopback-boot to pick them up.

   ```ts
   import {MyModel} from 'my-extension';
   ```

4. Optionally, if you want your models to be injectable, add them to the
   artifacts contributed by the extension.

   ```ts
   import {MyModel} from './models';

   export class MyComponent implements Component {
     models: [MyModel];
   }
   ```

## Advanced scenarios

LoopBack 4 does not yet provide recipes for extensions sharing models together
with their persistence behavior and their REST APIs. Please join the discussion
in [loopback-next#5476](https://github.com/strongloop/loopback-next/issues/5476)
to let us know about your use cases and to subscribe for updates.
