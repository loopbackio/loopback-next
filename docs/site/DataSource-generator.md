---
lang: en
title: 'DataSource generator'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI
sidebar: lb4_sidebar
permalink: /doc/en/lb4/DataSource-generator.html
---

{% include content/generator-create-app.html lang=page.lang %}

### Synopsis

Adds a new [DataSource](DataSources.md) class and config files to a LoopBack
application.

```sh
lb4 datasource [options] [<name>]
```

### Options

`--connector` : Name of datasource connector

This can be a connector supported by LoopBack / Community / Custom.

{% include_relative includes/CLI-std-options.md %}

### Arguments

`<name>` - Required name of the datasource to create as an argument to the
command. If provided, the tool will use that as the default when it prompts for
the name.

### Interactive Prompts

The tool will prompt you for:

- **Name of the datasource.** _(dataSourceName)_ If the name had been supplied
  from the command line, the prompt is skipped and the datasource is built with
  the name from the command-line argument.
- **Name of connector.** If not supplied via command line, you will be presented
  with a list of connector to select from (including an `other` option for
  custom connector).
- **Connector configuration.** If the connector is not a custom connector, the
  CLI will prompt for the connector configuration information.

### Output

Once all the prompts have been answered, the CLI will do the following:

- Install `@loopback/repository` and the connector package (if it's not a custom
  connector).
- Create a DataSource class which receives the connector config using
  [Dependency Injection](Dependency-injection.md) as follows:
  `/src/datasources/${dataSourceName}.datasource.ts`. The connector
  configuration provided via CLI is available via static property
  `defaultConfig`.
- Update `/src/datasources/index.ts` to export the newly created DataSource
  class.

### Legacy JSON-based configuration

Datasources created by a CLI version from before April 2020 are using JSON-based
file convention for defining datasources:

- `/src/datasources/${dataSourceName}.datasource.config.json` contains
  datasource configuration in JSON format, e.g. the connector name, target host
  & port, credentials, and so on.
- `/src/datasources/${dataSourceName}.datasource.ts` defines a datasource class,
  the default configuration is loaded from the JSON file.

CLI commands like `lb4 repository` and `lb4 service` support both the old
(JSON-based) and the current (pure TypeScript) styles, there are no changes
immediately needed to make your existing project work with the recent CLI
versions.

However, we recommend to eventually migrate existing datasource files to the new
style.

#### Migration guide

1. Open `{dataSourceName}.datasource.ts` file and replace import of `config`
   from the JSON file with the actual content of the JSON file.

   For example:

   ```diff
   -import config from './db.datasource.config.json';
   +
   +const config = {
   +  "name": "db",
   +  "connector": "memory",
   +  "localStorage": "",
   +  "file": "./data/db.json",
   +};
   ```

2. Save the file, run Prettier to fix the coding style (change double-quotes `"`
   to single-quotes `'`, remove quotes from property names like `connector` and
   `file`).

   Example output using LoopBack's coding style:

   ```ts
   const config = {
     name: 'db',
     connector: 'memory',
     localStorage: '',
     file: './data/db.json',
   };
   ```

3. Add a static `defaultConfig` property to your datasource class.

   For example:

   ```diff
   export class DbDataSource extends juggler.DataSource {
     static dataSourceName = 'db';
   +  static readonly defaultConfig = config;

     constructor(
   ```

4. Modify the tests importing the default datasource configuration from the JSON
   file, get the default configuration via the new static property instead.

   This is typically needed by tests for service proxies, which are are working
   with a datasource connected to a web service. Datasources connected to a
   database usually don't need different configuration for tests.

   For example:

   ```diff
   -import GEO_CODER_CONFIG from '../datasources/geocoder.datasource.config.json';
   +import {GeocoderDataSource} from '../datasources/geocoder.datasource';

   //...

   export function getProxiedGeoCoderConfig(proxy: HttpCachingProxy) {
   -  return merge({}, GEO_CODER_CONFIG, {
   +  return merge({}, GeocoderDataSource.defaultConfig, {
       options: {
   ```

5. Delete the datasource JSON file, it's no longer needed.
