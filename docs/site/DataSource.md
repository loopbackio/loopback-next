---
lang: en
title: 'DataSource'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI
sidebar: lb4_sidebar
permalink: /doc/en/lb4/DataSource.html
redirect_from: /doc/en/lb4/DataSources.html
---

## Overview

A `DataSource` in LoopBack 4 is a named configuration for a Connector instance
that represents data in an external system. The Connector is used by
`legacy-juggler-bridge` to power LoopBack 4 Repositories for Data operations.

![Datasource diagram](imgs/datasource.png)

### Creating a DataSource

It is recommended to use the [`lb4 datasource` command](DataSource-generator.md)
provided by the CLI to generate a DataSource. The CLI will prompt for all
necessary connector information and create the following files:

- `${dataSource.dataSourceName}.datasource.ts` containing a class extending
  `juggler.DataSource`. This class can be used to override the default
  DataSource behavior programmatically. Note: The connector configuration is
  available in a static property `defaultConfig` and can be injected into the
  class constructor using [Dependency Injection](Dependency-injection.md).

The above file is generated in `src/datasources/` directory by the CLI. CLI will
also update `src/datasources/index.ts` to export the new DataSource class.

Example DataSource Class:

```ts
import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'db',
  connector: 'memory',
};

export class DbDataSource extends juggler.DataSource {
  static dataSourceName = 'db';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.db', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
```

### Creating a DataSource at Runtime

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

For details about datasource options, refer to the [DataSource
documentation])(https://apidocs.strongloop.com/loopback-datasource-juggler/#datasource)
.

Attach the newly created datasource to the app by calling `app.dataSource()`.

{% include note.html content="
The `app.datasource()` method is available only on application classes
with `RepositoryMixin` applied.
" %}
