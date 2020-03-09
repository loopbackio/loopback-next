---
lang: en
title: 'Migrating CRUD operation hooks'
keywords: LoopBack 4.0, LoopBack 4, LoopBack 3, Migration
sidebar: lb4_sidebar
permalink: /doc/en/lb4/migration-models-operation-hooks.html
---

{% include tip.html content="
Missing instructions for your LoopBack 3 use case? Please report a [Migration docs issue](https://github.com/strongloop/loopback-next/issues/new?labels=question,Migration,Docs&template=Migration_docs.md) on GitHub to let us know.
" %}

Operation hooks are not supported in LoopBack 4 yet. See the
[Operation hooks for models/repositories spike](https://github.com/strongloop/loopback-next/issues/1919)
to follow the progress made on this subject.

In the meantime, we are providing a temporary API for enabling operation hooks
in LoopBack 4: override `DefaultCrudRepository`'s `definePersistedModel` method
in the model's repository.

The `definePersistedModel` method of `DefaultCrudRepository` returns a model
class on which you can apply the
[LoopBack 3 operation hooks](https://loopback.io/doc/en/lb3/Operation-hooks.html).
Make sure to return the model class from your repository's
`definePersistedModel` method.

Here is an example of a repository implementing `definePersistedModel` and
applying an operation hook on a model:

```ts
class ProductRepository extends DefaultCrudRepository<
  Product,
  typeof Product.prototype.id,
  ProductRelations
> {
  constructor(dataSource: juggler.DataSource) {
    super(Product, dataSource);
  }

  definePersistedModel(entityClass: typeof Product) {
    const modelClass = super.definePersistedModel(entityClass);
    modelClass.observe('before save', async ctx => {
      console.log(`going to save ${ctx.Model.modelName}`);
    });
    return modelClass;
  }
}
```

Although possible, we are not providing an API which directly exposes the
`observe` method of the model class. The current API makes the registration of
operation hooks a process that is possible only at the time when the model class
is attached to the repository and accidental registration of the same operation
hook multiple times becomes obvious. With an API which directly exposes the
`observe` method of the model class, this would not have been possible.
