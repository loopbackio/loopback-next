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

### Common Tasks

- [Create DataSource at runtime](Creating-datasource-runtime.md)

### Connector

{% include note.html content=" This is a placeholder page, the task of adding content is tracked by the following GitHub issue: loopback-next#6092 " %}

<!-- TODO

- what is connectors
- what role it plays in req/res cycle, and what relation it has between model and other artifacts (briefly)
- connector types (add links ):
  - SQL (transaction), NoSQL (freeform properties)
  - Services connectors (service proxy) and others
  - (optional) In-memory connector
  - (optional) Community connector

  -->
