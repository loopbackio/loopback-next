---
lang: en
title: 'Relation generator'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Relation-generator.html
---

### Prerequisites

Important: Before running this generator, make sure the models, datasource, and
repositories involved in this relation exist. Then, inside your LoopBack
application, run the command from the root directory.

{% include content/generator-create-app.html lang=page.lang %}

### Synopsis

Adds a new `Relation` between existing source and target models in a LoopBack
application.

```sh
lb4 relation [options]
```

### Options

- `-h`, `--help`: Print the generator’s options and usage.
- `--skip-cache`: Do not remember prompt answers. Default: `false`.
- `--skip-install`: Do not automatically install dependencies. Default: `false`.
- `--force-install`: Fail on install dependencies error. Default: `false`.
- `--relationType`: Relation type.
- `--sourceModel`: Source model.
- `--destinationModel`: Destination model.
- `--foreignKeyName`: Destination model foreign key name.
- `--relationName`: Relation name.
- `-c`, `--config`: JSON file name or value to configure options.
- `-y`, `--yes`: Skip all confirmation prompts with default or provided value.
- `--format`: Format generated code using `npm run lint:fix`.

### Arguments

Defining lb4 relation in one command line interface (cli):

```sh
lb4 relation --sourceModel=<sourceModel>
--destinationModel=<destinationModel> --foreignKeyName=<foreignKeyName>
--relationType=<hasMany|belongsTo> [--relationName=<relationName>] [--format]
```

- `<relationType>` - Type of the relation that will be created between the
  source and target models.

- `<sourceModel>` - Name of the model to create the relationship from.

- `<destinationModel>` - Name of the model to create a relationship with.

- `<foreignKeyName>` - Property that references the primary key property of the
  destination model.

- `<relationName>` - Name of the relation that will be created.

After setting up the definition for the relation, you need to confirm if you
want to register the inclusion resolver for this relation:

```ts
? Allow <sourceModel> queries to include data from related <destinationModel> instances? (Y/n)
```

Check the site [Relations](HasMany-relation.md) and the
[Querying Related Models](HasMany-relation.md#querying-related-models) section
in each relation for more use cases.

### Interactive Prompts

The tool will prompt you for:

- **Relation `type` between models.** _(relationBaseClass)_ Prompts a list of
  available relations to choose from as the type of the relation between the
  source model and the target model. Supported relation types:

  - [HasMany](HasMany-relation.md)
  - [BelongsTo](BelongsTo-relation.md)

- **Name of the `source` model.** _(sourceModel)_ Prompts a list of available
  models to choose from as the source model of the relation.

- **Name of the `target` model.** _(targetModel)_ Prompts a list of available
  models to choose from as the target model of the relation.

- **Name of the `Source property`.** _(relationName)_ Prompts for the Source
  property name. Note: Leave blank to use the default.

  Default values:

  - `<targetModel><targetModelPrimaryKey>` for `belongsTo` relations, e.g.
    `categoryId`
  - plural form of `<targetModel>` for `hasMany` relations, e.g. `products`

- **Name of Foreign key** _(foreignKeyName)_ to be created in target model. For
  hasMany relation type only, default: `<sourceModel><sourceModelPrimaryKey>`.
  Note: Leave blank to use the default.

### Output

Once all the prompts have been answered, the CLI will update or create source
files for the Entities involved in the relation.

- Update source Model class as follows:
  `/src/models/${sourceModel-Name}.model.ts`
- Update target Model class as follows:
  `/src/models/${targetModel-Name}.model.ts`
- Update source Model Repository class as follows:
  `/src/repositories/${sourceModel-Repository-Name}.repository.ts`
- Update target Model Repository class as follows:
  `/src/repositories/${targetModel-Repository-Name}.repository.ts`
- Create a Controller for the new relation as follows:
  `/src/controllers/{sourceModel-Name}-{targetModel-Name}.controller.ts`
- Update `/src/controllers/index.ts` to export the newly created Controller
  class.
