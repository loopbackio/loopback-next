---
lang: en
title: 'DataSource generator'
keywords: LoopBack 4.0, LoopBack 4
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
- Create a file with the connector configuration as follows:
  `/src/datasources/${dataSource.dataSourceName}.datasource.config.json`
- Create a DataSource class which recieves the connector config using
  [Dependency Injection](Dependency-injection.md) as follows:
  `/src/datasources/${dataSource.dataSourceName}.datasource.ts`
- Update `/src/datasources/index.ts` to export the newly created DataSource
  class.
