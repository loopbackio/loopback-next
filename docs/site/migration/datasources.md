---
lang: en
title: 'Migrating datasources'
keywords: LoopBack 4.0, LoopBack 4, LoopBack 3, Migration
sidebar: lb4_sidebar
permalink: /doc/en/lb4/migration-datasources.html
---

## Overview

LoopBack 3 datasources are compatible with LoopBack 4 datasources, so migrating
datasources from LoopBack 3 to LoopBack 4 is simple.

In LoopBack 3, all datasources are defined in the `server/datasources.json`
file, whereas in LoopBack 4 each datasource is defined in its own file in the
`src/datasources` folder. Each LoopBack 4 datasource has a configuration file
(e.g. `mysql-ds.datasource.config.json`) and a class file (e.g.
`mysql-ds.datasource.ts`).

## Migration Steps

To migrate a datasource from LoopBack 3 to LoopBack 4, complete the following
steps:

1. In the root of your LoopBack 4 application, use the `lb4 datasource` command
   to create a new datasource and enter the same datasource name as your
   LoopBack 3 application's datasource (e.g. `mysqlDs`):

   ```
   $ lb4 datasource
   ? Datasource name: mysqlDs
   ```

2. For the remaining prompts from the `lb4 datasource` command, use the defaults
   (press Enter for each one) since these will be replaced in the next step:

   ```
   ? Select the connector for mysqlDs: In-memory db (supported by StrongLoop)
   ? window.localStorage key to use for persistence (browser only):
   ? Full path to file for persistence (server only):
   ```

3. Replace the contents of the newly created
   `src/datasources/{dataSource.dataSourceName}.datasource.config.json` file in
   your LoopBack 4 application with the datasource configuration from
   `server/datasources.json` in your LoopBack 3 application.

   For example, if your `server/datasources.json` file contains:

   ```json
   {
     "mysqlDs": {
       "name": "mysqlDs",
       "connector": "mysql",
       "host": "demo.strongloop.com",
       "port": 3306,
       "database": "getting_started",
       "username": "demo",
       "password": "L00pBack"
     }
   }
   ```

   Move it to `src/datasources/mysql-ds.datasource.config.json`, so that it
   looks as follows:

   ```json
   {
     "name": "mysqlDs",
     "connector": "mysql",
     "host": "demo.strongloop.com",
     "port": 3306,
     "database": "getting_started",
     "username": "demo",
     "password": "L00pBack"
   }
   ```

4. Repeat steps 1-3 for each datasource you want to migrate.

{% include note.html content="We are working on a CLI command `lb4 import-lb3-datasources` that will migrate datasources from a mounted LoopBack 3 application to a LoopBack 4 project automatically. See [GitHub issue #4346](https://github.com/strongloop/loopback-next/issues/4346) for more details." %}

## Compatibility

As mentioned before, LoopBack 3 datasources are compatible with LoopBack 4
datasources. In both, a datasource is a connector instance that is used by
`legacy-juggler-bridge`. For example, both a LoopBack 3 MySQL datasource and a
LoopBack 4 MySQL datasource will use
[`loopback-connector-mysql`](http://github.com/strongloop/loopback-connector-mysql).
