---
lang: en
title: 'Relation generator'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Relation-generator.html
---

{% include content/generator-create-app.html lang=page.lang %}

The models involved in the relation must exist before running this generator.

### Synopsis

Adds a new `Relation` between existing source and target models in a LoopBack
application.

```sh
lb4 relation [options] [<idProperty>]
```

### Options

TBD

### Arguments

`<idProperty>` - Name of the ID property that will be created in the source
model. If not provided, the tool will use `id` as the default name when it
prompts for the ID property name.

### Interactive Prompts

The tool will prompt you for:

- **Relation `type` between models.** _(relationBaseClass)_ Prompts a list of
  available relations to choose from as the type of the relation between the
  source model and the target model. Supported relation types:

  - hasMany
  - hasOne
  - belongsTo

- **Name of the `source` model.** _(sourceModel)_ Prompts a list of available
  models to choose from as the source model of the relation.

- **Name of the `target` model.** _(targetModel)_ Prompts a list of available
  models to choose from as the target model of the relation. Note: The selected
  `source` model will not appear in the `target` model list.

- **Name of the `ID property` in the source model.** _(Optional, default: `id`)_
  Prompts for the ID property name (serves as the foreign key) in the source
  model. Note: Leave blank to use the default.

- **Name for the `property relation` in the source model.** TBD

### Output

Once all the prompts have been answered, the CLI will do the following:

- Update source Model class as follows:
  `/src/models/${sourceModel-Name}.model.ts`
- Update target Model class as follows:
  `/src/models/${targetModel-Name}.model.ts`
- Update source Model Repository class as follows:
  `/src/repositories/${sourceModel-Repository-Name}.repository.ts`
- Update target Model Repository class as follows:
  `/src/repositories/${targetModel-Repository-Name}.repository.ts`
- Create a Controller for the new relation as follows:
  `/src/controllers/{sourceModel}-{targetModel}.controller.ts`
- Update `/src/controllers/index.ts` to export the newly created Controller
  class.
