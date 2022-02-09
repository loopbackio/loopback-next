---
lang: en
title: 'Creating DataSources at Runtime'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, DataSource
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Creating-datasource-runtime.html
summary: Create LoopBack DataSources at runtime
---

A datasource can be created at runtime by creating an instance of
`juggler.DataSource`. It requires a name for the datasource, the connector, and
the connection details.

```ts
import {juggler} from '@loopback/repository';
const dsName = 'bookstore-ds';
const bookDs = new juggler.DataSource({
  name: dsName,
  connector: require('loopback-connector-mongodb'),
  url: 'mongodb://sysop:moon@localhost',
});
await bookDs.connect();
app.dataSource(bookDs, dsName);
```

For details about datasource options, refer to the
[DataSource documentation](https://apidocs.loopback.io/loopback-datasource-juggler/#datasource).

Attach the newly created datasource to the app by calling `app.dataSource()`.

{% include note.html content="
The `app.datasource()` method is available only on application classes
with `RepositoryMixin` applied.
" %}
