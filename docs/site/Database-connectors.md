---
title: "Database connectors"
lang: en
keywords: LoopBack
tags: [data_sources]
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Database-connectors.html
summary: LoopBack provides connectors for popular relational and NoSQL databases.
---

LoopBack database connectors implement create, retrieve, update, and delete operations as a common set of methods of
[PersistedModel](https://apidocs.loopback.io/loopback/#persistedmodel).
When you attach a model to a data source backed by one of the database connectors, the model automatically acquires the create, retrieve, update, and delete methods from  PersistedModel.
The data access methods on a persisted model are exposed to REST by default; see
[PersistedModel REST API](PersistedModel-REST-API.html) for the endpoints.

You can connect models using relations to reflect relationships among data. For more information about relations, see [Creating model relations](Creating-model-relations.html).

The officially-supported database connectors are:

{% include list-children.html in=site.data.sidebars.lb4_sidebar %}
