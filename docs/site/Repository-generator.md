---
lang: en
title: 'Repository generator'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Repository-generator.html
---

{% include content/generator-create-app.html lang=page.lang %}

### Synopsis

Adds a new
[Repository class (or multiple backed by the same datasource)](Repositories.md)
to a LoopBack application with one single command.

```sh
lb4 repository [options] [<name>]
```

### Options

`--datasource` : _(Optional)_ name of a valid datasource already created in
src/datasources

`--model` : _(Optional)_ name of a valid model already created in src/models

`--id` : _(Optional)_ name of the property serving as **ID** in the selected
model. If you supply this value, the CLI will not try to infer this value from
the selected model file.

`--repositoryBaseClass` : _(Optional)_ _(Default: DefaultCrudRepository)_ name
of the base class the repository will inherit. If no value was supplied,
**DefaultCrudRepository** will be used.

### Configuration file

This generator supports a config file with the following format, see the
Standard options below to see different ways you can supply this configuration
file.

```ts
{
  "name": "repositoryNameToBeGenerated",
  "datasource": "validDataSourceName",
  "model": "validDModelName",
  "id": "anOptionalNameForID",
  "repositoryBaseClass": "validRepositoryBaseClass"
}
```

### Notes

Service oriented datasources such as REST or SOAP are not considered valid in
this context and will not be presented to you in the selection list.

There should be at least one valid _(KeyValue or Persisted)_ data source and one
model already created in their respective directories.

{% include_relative includes/CLI-std-options.md %}

### Arguments

`<name>` - Optional argument specifyng the respository name to be generated. In
case you select multiple models, the first model will take this argument for its
repository file name.

### Interactive Prompts

The tool will prompt you for:

- **Please select the datasource.** _(name)_ If the name of the datasource had
  been supplied from the command line, the prompt is skipped, otherwise it will
  present you the list of available datasources to select one. It will use this
  datasource to check what kind of repository it will generate.

- **Select the model(s) you want to generate a repository.** _(model)_ If the
  name of the model had been supplied from the command line with `--model`
  option and it is a valid model, then the prompt is skipped, otherwise it will
  present the error `Error: No models found` in the console.

  If no `--model` is supplied, then the it will present you with a valid list of
  models from `src/models` directory and you will be able to select one or
  multiple models. The tool will generate a repository for each of the selected
  models.

  **NOTE:** The tool will inspect each of the selected models and try to find
  the name of the property serving as **ID** for the model.

- **Please select the repository base class.** _(repository)_ if the name of a
  valid base class has been supplied from the command line, the prompt is
  skipped, otherwise it will present you a list of repositories. The default
  repository is infered from the datasource type.

  Any repository in the `src/repository` folder with the file format
  `*.repository.base.ts` will be added to the list too.

- **Please enter the name of the ID property for _modelName_.** _(id)_ If the
  CLI cannot find the corresponding ID property name for the model, it will
  prompt you to enter a name here. If you don't specify any name, it will use
  _id_ as the default one.

### Output

Once all the prompts have been answered, the CLI will do the following for each
of the selected models.

- Create a Repository class as follows:
  `/src/repositories/${modelName}.repository.ts`
- Update `/src/repositories/index.ts` to export the newly created Repository
  class.
