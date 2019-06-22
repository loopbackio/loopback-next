---
lang: en
title: 'Service generator'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Service-generator.html
---

{% include content/generator-create-app.html lang=page.lang %}

### Synopsis

Adds a new Service class to a LoopBack application with one single command.

```sh
lb4 service [options] [<name>]
```

### Options

`--datasource` : _(Optional)_ name of a valid REST or SOAP datasource already
created in src/datasources

### Configuration file

This generator supports a config file with the following format, see the
Standard options below to see different ways you can supply this configuration
file.

```ts
{
  "name": "serviceNameToBeGenerated",
  "datasource": "validDataSourceName",
}
```

### Notes

There should be at least one valid _(REST or SOAP)_ data source created already
in the `src/datasources` directory.

{% include_relative includes/CLI-std-options.md %}

### Arguments

`<name>` - Optional argument specifyng the service name to be generated.

### Interactive Prompts

The tool will prompt you for:

- **Please select the datasource.** _(datasource)_ If the name of the datasource
  had been supplied from the command line with `--datasource` option and it is a
  valid one, then the prompt is skipped, otherwise it will present you the list
  of all valid datasources from the `src/datasources` directory.

- **Service name.** _(name)_ If the name of the service to be generated had been
  supplied from the command line, the prompt is skipped.

### Output

Once all the prompts have been answered, the **CLI** will generate a basic
skeleton for your service.

- Create a Service class as follows: `/src/services/${name}.service.ts`
- Update `/src/services/index.ts` to export the newly created Service class.
