---
lang: en
title: 'Migrating models'
keywords: LoopBack 4.0, LoopBack 4, LoopBack 3, Migration
sidebar: lb4_sidebar
permalink: /doc/en/lb4/migration-models-overview.html
---

**FIXME:** Explain at high level how to migrate models from a LB3 app to a LB4
project. Refer to sub-sections for model details.

In LoopBack 3, models are the cornerstone. They describe shape of data (schema),
provide persistence-related behavior and implement public (REST) API. Besides
this core functionality, there are many ways how to extend the built-in
behavior.

In LoopBack 4, many things changed but some remain the same. A model class is no
longer responsible for everything. We have Models to describe shape of data,
Repositories to provide persistence-related behavior and finally Controllers to
implement public APIs. Under the hood, repositories are re-using a lot of the
same persistence implementation you may know from LoopBack 3, therefore some
concepts remain unchanged.

To make the migration guide easier to navigate, we split model-related
instructions into several sub-sections.

1. [Migrating model definitions and built-in APIs](./core.md) describes how to
   migrate the core of your Models - the model definition, persistence behavior
   and public API provided by the framework itself.

2. [Migrating model relations](./relations.md) explains how to migrate
   relations, from the definition of a relation to its public APIs.

3. [Migrating custom model methods](./methods.md) show how to bring over custom
   methods that are enhancing models with new functionality, adding to the
   features provided by the framework.

4. [Migrating remoting hooks](./remoting-hooks.md) explains how to migrate hooks
   that are executed by the REST API layer.

5. [Migrating CRUD operation hooks'](./operation-hooks.md) shows how to migrate
   hooks (observers) that are executed by the persistence layer.

6. [Migrating model mixins](./mixins.md) provides instructions for migrating
   mixins - small components that can enhance Model schema, behavior, or both.
