---
title: 'Memory connector'
lang: en
layout: page
keywords: LoopBack
tags: connectors
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Memory-connector.html
summary:
  The built-in memory connector is a persistent data source for development and
  testing.
---

## Overview

LoopBack's built-in memory connector enables you to test your application
without connecting to an actual persistent data source such as a database.
Although the memory connector is very well tested it is not suitable for
production.

The memory connector supports:

- Standard query and create, read, update, and delete operations, so you can
  test models against an in-memory data source.

{% include important.html content=" The memory connector is designed for
development and testing of a single-process application without setting up a
database. It cannot be used in a cluster as the worker processes will have their
own isolated data not shared in the cluster.

You can persist data between application restarts using the `file` property. See
[Data persistence](#data-persistence) for more information. " %}

### Limitations

The connector does not implement transactions. Hence, transactions will fail
with an error.

### Memory connector properties

<table>
  <tbody>
    <tr>
      <th>Property</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
    <tr>
      <td>name</td>
      <td>String</td>
      <td>Name by which you refer to the data source.</td>
    </tr>
    <tr>
      <td>connector</td>
      <td>String</td>
      <td>Must be "memory" to use the memory connector.</td>
    </tr>
    <tr>
      <td>localStorage</td>
      <td>String</td>
      <td>
          <b>Not recommended.</b> Path to the browser Local Storage. This is
          kept for legacy reasons and may be removed in a future release.
        </td>
    </tr>
    <tr>
      <td>file</td>
      <td>String</td>
      <td>
        <p>Path to file where the connector will store data, relative to application root directory.</p>
        <p>NOTE: The connector will create the file if necessary, but the directory containing the file must exist.</p>
      </td>
    </tr>
  </tbody>
</table>

{% include important.html content="
If you specify the file property, the connector will save data there that will persist when you restart the application.
Otherwise, the memory connector does not persist data after an application stops.
" %}

## Data persistence

By default, data in the memory connector are transient. When an application
using the memory connector exits, all model instances are lost. To maintain data
across application restarts, specify a JSON file in which to store the data with
the `file` property when creating the data source.

The simplest way to do this is by editing
`src/datasources/[datasource name].datasource.ts`; for example:

{% include code-caption.html content="src/datasources/db.datasource.ts" %}

```diff
import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'db',
  connector: 'memory',
  localStorage: '',
+ file: './data/db.json',
- file: '',
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
