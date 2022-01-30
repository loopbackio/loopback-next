---
lang: en
title: 'Relations'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Model Relation
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Relations.html
---

{% include note.html content="There are certain limitations to
`Inclusion Resolver`. See [Limitations](Relations.md#limitations)." %}

## Overview

Individual models are easy to understand and work with. But in reality, models
are often connected or related. When you build a real-world application with
multiple models, you’ll typically need to define relations between models. For
example:

- A customer has many orders and each order is owned by a customer.
- A user can be assigned to one or more roles and a role can have zero or more
  users.
- A physician takes care of many patients through appointments. A patient can
  see many physicians too.

With connected models, LoopBack exposes as a set of APIs to interact with each
of the model instances and query and filter the information based on the
client’s needs.

Model relation in LoopBack 3 is one of its powerful features which helps users
define real-world mappings between their models, access sensible CRUD APIs for
each of the models, and add querying and filtering capabilities for the relation
APIs after scaffolding their LoopBack applications. In LoopBack 4, with the
introduction of [repositories](Repository.md), we aim to simplify the approach
to relations by creating constrained repositories. This means that certain
constraints need to be honoured by the target model repository based on the
relation definition, and thus we produce a constrained version of it as a
navigational property on the source repository. Additionally, we also introduce
the concept of the `inclusion resolver` in relations, which helps to query data
over different relations. LoopBack 4 creates a different inclusion resolver for
each relation type.

Here are the currently supported relations:

- [HasMany](HasMany-relation.md)
- [BelongsTo](BelongsTo-relation.md)
- [HasOne](HasOne-relation.md)
- [HasManyThrough](HasManyThrough-relation.md)
- [ReferencesMany](ReferencesMany-relation.md)

{% include note.html content="
The `hasMany` relation may alternatively be implemented using the
`referencesMany` and `embedsMany` relations. These relations are similar, but
not the same. Since each database paradigm comes with different trade-offs and
thus different databases require the applications to use different relation
types, use the [relation best suited for your database](https://github.com/loopbackio/loopback-next/issues/2341).
" %}

The articles on each type of relation above will show you how to leverage the
new relation engine to define and configure relations in your LoopBack
application.

To generate a `HasMany`, `HasOne`, `BelongsTo`, or `hasManyThrough` relation
through the CLI, see [Relation generator](Relation-generator.md).

## Weak vs Strong Relations

LoopBack 4 implements _weak relations_ with `@belongsTo()`, `@hasMany()`,
`@hasOne`, etc. This means the constraints are enforced by LoopBack 4 itself,
not the underlying database engine. This is useful for integrating
cross-database relations, thereby allowing LoopBack 4 applications to partially
take the role of a data lake.

However, this means that invalid data could be keyed in outside of the LoopBack
4 application. To resolve this issue, some LoopBack 4 connectors (such as
[PostgreSQL](./PostgreSQL-connector.md#auto-migrateauto-update-models-with-foreign-keys)
and
[MySQL](MySQL-connector.md#auto-migrateauto-update-models-with-foreign-keys))
allow defining a
[_foreign key constraint_](https://en.wikipedia.org/wiki/Foreign_key) through
the `@model` decorator. Please consult the respective connector documentation to
check for compatibility.

[Issue #2331](https://github.com/loopbackio/loopback-next/issues/2331) tracks
native support for foreign key constraints in relation decorators (such as
`@belongsTo`).

## Limitations

### Filtering by parent model

[Where filters](https://loopback.io/doc/en/lb3/Where-filter.html) such as those
used by model queries (`create()`, `find()`, `replaceById()`, and so on) cannot
be used to filter a model by the value of its parent model. See its
[GitHub issue](https://github.com/loopbackio/loopback-next/issues/4299).

### Splitting numbers of queries

It doesn’t split numbers of queries. Related GH issue:
[Support inq splitting](https://github.com/loopbackio/loopback-next/issues/3444).

### Handling of MongoDB `ObjectID` type

It might not work well with ObjectID of MongoDB. Related GH issue:
[Spike: robust handling of ObjectID type for MongoDB](https://github.com/loopbackio/loopback-next/issues/3456).
