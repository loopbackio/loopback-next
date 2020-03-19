---
lang: en
title: 'REST CRUD model endpoints generator'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Rest-Crud-generator.html
---

{% include content/generator-create-app.html lang=page.lang %}

### Synopsis

Adds a new
[Rest config for model endpoint (or multiple backed by the same datasource)](Creating-CRUD-REST-apis.md)
to a LoopBack application with one single command.

```sh
lb4 rest-crud [options]
```

### Options

`--datasource` : _(Optional)_ name of a valid datasource already created in
src/datasources

`--model` : _(Optional)_ name of a valid model already created in src/models

`--basePath` : _(Optional)_ base path of the model endpoint

### Configuration file

This generator supports a config file with the following format, see the
Standard options below to see different ways you can supply this configuration
file.

```ts
{
  "datasource": "validDataSourceName",
  "model": "validModelName",
  "basePath": "/<base-path>"
}
```

### Notes

Service oriented datasources such as REST or SOAP are not considered valid in
this context and will not be presented to you in the selection list.

There should be at least one valid _(Persisted)_ data source and one model
already created in their respective directories.

{% include_relative includes/CLI-std-options.md %}

### Interactive Prompts

The tool will prompt you for:

- **Please select the datasource.** _(name)_ If the name of the datasource had
  been supplied from the command line, the prompt is skipped, otherwise it will
  present you the list of available datasources to select one. It will use this
  datasource to check what kind of model endpoint it will generate.

- **Select the model(s) you want to generate a model endpoint.** _(model)_ If
  the name of the model had been supplied from the command line with `--model`
  option and it is a valid model, then the prompt is skipped, otherwise it will
  present the error `Error: No models found` in the console.

  If no `--model` is supplied, then the it will present you with a valid list of
  models from `src/models` directory and you will be able to select one or
  multiple models. The tool will generate a rest config of model endpoint for
  each of the selected models.

- **Please specify the base path.**. _(basePath)_ If the base path had been
  supplied from the command line with `--basePath` option or more than one
  models are selected, the prompt is skipped.

### Output

Once all the prompts have been answered, the CLI will do the following for each
of the selected models.

- Create a rest config file for selected models as follows:
  `/src/model-endpoints/${modelName}.rest-config.ts`
