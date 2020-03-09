---
lang: en
title: 'Migrating model relations'
keywords: LoopBack 4.0, LoopBack 4, LoopBack 3, Migration
sidebar: lb4_sidebar
permalink: /doc/en/lb4/migration-models-relations.html
---

{% include tip.html content="
Missing instructions for your LoopBack 3 use case? Please report a [Migration docs issue](https://github.com/strongloop/loopback-next/issues/new?labels=question,Migration,Docs&template=Migration_docs.md) on GitHub to let us know.
" %}

When you define a relation in a LoopBack 3 model JSON file, the framework will
create the following artifacts for you automatically:

- Relation metadata defining the target model, foreign key column/property, and
  so on.
- Repository-like methods for accessing related model instance(s), for example
  `Category.prototype.products`.
- An inclusion resolver to allow clients to request relation traversal in
  queries and include related models, e.g.
  `Product.find({include: ['category']})`
- REST API endpoints for querying a modifying models on the other side of the
  relation, e.g. `GET /api/categories/1/products`.

In LoopBack 4, these building blocks are typically provided by the application
developer.

- Relation metadata is defined via model decorators like `@hasMany`.
- Relation repositories implement APIs for accessing and modifying data of
  related models.
- Inclusion resolvers implement relation traversal in queries.
- Relation controllers implement REST APIs for model relations.

At the moment, all of these artifacts are defined via source code files which
are typically created by running `lb4 relation`. With source code files ready to
be edited, developers get a lot of power and flexibility in customizing the
default behavior offered by the framework.

In the future, we would like to provide a declarative approach for building
model relations: the developer defines relation metadata, and the framework
builds all required artifacts at runtime, similar to how LoopBack 3 works. You
can join the discussion in the GitHub issue
[loopback-next#2483](https://github.com/strongloop/loopback-next/issues/2483).

## Migration path

Follow these steps to migrate a model relation from LoopBack 3 to LoopBack 4:

1. Make sure to complete all steps described in
   [Migrating model definitions and built-in APIs](./core.md), especially the
   creation of Repository classes for models on both sides of the relation.

2. Run `lb4 relation` to define the model relation in your model class, generate
   code for the relation repository and optionally register inclusion resolver.
   This command will also create a new Controller class implementing public REST
   API for your relation.

You can learn more about `lb4 relation` command in
[Relation generator](../../Relation-generator.md).

## Relation types

The following relations are supported by LoopBack 4 and can be migrated from
LoopBack 3:

- [HasMany](../../HasMany-relation.md)
- [HasOne](../../HasOne-relation.md)
- [BelongsTo](../../BelongsTo-relation.md)

Other relations types are not supported yet, you can subscribe to our progress
in the high-level tracking issue
[loopback-next#1450](https://github.com/strongloop/loopback-next/issues/1450).
See also issues for individual relation types as mentioned in the tracking
issue, for example:

- HasManyThrough -
  [loopback-next#2264](https://github.com/strongloop/loopback-next/issues/2264)
- HasAndBelongsToMany -
  [loopback-next#2308](https://github.com/strongloop/loopback-next/issues/2308)
- Polymorphic relations -
  [loopback-next#2487](https://github.com/strongloop/loopback-next/issues/2487)
- ReferencesMany -
  [loopback-next#2488](https://github.com/strongloop/loopback-next/issues/1450)
