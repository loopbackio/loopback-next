---
lang: en
title: 'Model generator'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Model-generator.html
---

{% include content/generator-create-app.html lang=page.lang %}

### Synopsis

Adds a new [Model](Model.md) class to a LoopBack application.

```sh
lb4 model [options] [<name>]
```

### Options

`--base` : _(Optional)_ a valid model already created in src/models or any of
the core based class models Entity or Model. Your new model will extend this
selected base model class.

{% include_relative includes/CLI-std-options.md %}

### Arguments

`<name>` - Required name of the model to create as an argument to the command.
If provided, the tool will use that as the default when it prompts for the name.

### Interactive Prompts

The tool will prompt you for:

- **Name of the model.** _(modelName)_ If the name had been supplied from the
  command line, the prompt is skipped and the datasource is built with the name
  from the command-line argument.

- **Model base class.** _(modelBaseClass)_ If the command line option --base had
  been supplied with a valid model class name, the prompt is skipped. It will
  present you with a list of available models from `src/models` including the
  **Entity** and **Model** at the top of the list.
  - An **Entity** is a persisted model with an identity (ID).
  - A **Model** is a business domain object.
  - For more information, see
    [here](https://loopback.io/doc/en/lb4/Model.html#overview).

The tool will next recursively prompt you for the model's properties until a
blank one is entered. Properties will be prompted for as follows:

- **Name of the property.** To add a property, enter a name here. To end the
  property prompt loop, leave this blank and press enter.
- **Property type.** Select the type for the property from the following
  options: `string`, `number`, `boolean`, `object`, `array`, `date`, `buffer`,
  `geopoint`, `any`.
- **Is ID Field.** Defaults to **no**. If the property is the ID for the Model,
  enter **Y** or **yes**. This will only be prompted until a property is marked
  as the `id` for the Model.
- **Required.** Defaults to **no**. If the property is required, enter **Y** or
  **yes**.
- **Default value.** Set a default value for the property if one isn't supplied.
  Leave blank otherwise.

### Output

Once all the prompts have been answered, the CLI will do the following:

- Create a Model class as follows: `/src/models/${modelName}.model.ts`
- Update `/src/models/index.ts` to export the newly created Model class.
