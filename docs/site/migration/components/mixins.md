---
lang: en
title: 'Migrating components contributing Model mixins'
keywords:
  LoopBack 4, LoopBack 3, Node.js, TypeScript, OpenAPI, Migration, Extensions,
  Components, Mixins
sidebar: lb4_sidebar
permalink: /doc/en/lb4/migration-extensions-mixins.html
---

{% include tip.html content="
Missing instructions for your LoopBack 3 use case? Please report a [Migration docs issue](https://github.com/strongloop/loopback-next/issues/new?labels=question,Migration,Docs&template=Migration_docs.md) on GitHub to let us know.
" %}

In LoopBack 3, a component contributes mixins by providing files exporting mixin
functions, for example:

```js
// lib/my-mixin.js
module.exports = myMixin(Model, options) {
   // modify the target model provided in `Model`
   // apply configuration as specified in `options`
};
```

In LoopBack 4, models are architecturally decoupled into 3 entities (a model, a
repository and a controller), as further explained in
[Migrating models](../models/overview.md) and
[Migrating custom model methods](../models/methods.md). As a result, most
LoopBack 3 mixins become a set of multiple mixins in LoopBack 4.

To migrate a mixin from a LoopBack 3 component to a LoopBack 4 component:

1. Follow the steps described in
   [Migrating model mixins ](https://loopback.io/doc/en/lb4/migration-models-mixins.html)
   to convert your mixin implementation to LB4 style. We recommend to put the
   new files to `src/mixins` directory in your LB4 component project.

2. Modify your LB4 component to export the mixins - add `export` statements to
   components `src/index.ts` file. For example:

   ```ts
   // src/index.ts
   export * from './mixins/my-mixin';
   ```

3. Update your documentation to show how to apply the new mixins in LoopBack 4
   applications, use the content provided in
   [Migrating model mixins ](https://loopback.io/doc/en/lb4/migration-models-mixins.html)
   for inspiration.
