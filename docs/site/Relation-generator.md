---
lang: en
title: 'Relation generator'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Model Relation
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Relation-generator.html
---

### Prerequisites

Important: Before running this generator, make sure the models, datasource, and
repositories involved in this relation exist. Then, inside your LoopBack 4
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
- `--throughModel`: Through model. For HasManyThrough relation only.
- `--foreignKeyName`: Destination/Source model foreign key name for
  HasMany,HasOne/BelongsTo relation, respectively.
- `--relationName`: Relation name.
- `--sourceKeyOnThrough`: Foreign key that references the source model on the
  through model. For HasManyThrough relation only.
- `--targetKeyOnThrough`: Foreign key that references the target model on the
  through model. For HasManyThrough relation only.
- `-c`, `--config`: JSON file name or value to configure options.
- `-y`, `--yes`: Skip all confirmation prompts with default or provided value.
- `--format`: Format generated code using `npm run lint:fix`.

### Arguments

Defining lb4 relation in one command line interface (cli):

```sh
lb4 relation --sourceModel=<sourceModel>
--destinationModel=<destinationModel> --foreignKeyName=<foreignKeyName>
--relationType=<hasMany|hasOne|belongsTo> [--relationName=<relationName>] [--format]
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

#### HasManyThrough

Defining a HasManyThrough relation via the CLI is a bit different from defining
HasMany, HasOne, or BelongsTo relations.

```sh
lb4 relation --sourceModel=<sourceModel>
--destinationModel=<destinationModel> --throughModel=<throughModel>
--relationType=<hasManyThrough> [--relationName=<relationName>]
[--sourceKeyOnThrough=<sourceKeyOnThrough>] [--targetKeyOnThrough<targetKeyOnThrough>]
```

- `<throughModel>` - Name of the model to reference the source model and target
  model.

- `<sourceKeyOnThrough>` - Property on the through model that references the
  primary key property of the source model.

- `<targetKeyOnThrough>` - Property on the through model that references the
  primary key property of the target model.

### Interactive Prompts

The tool will prompt you for:

- Relation type between models (`relationBaseClass`). Prompts a list of
  available relations to choose from as the type of the relation between the
  source model and the target model. Supported relation types:

  - [HasMany](HasMany-relation.md)
  - [HasManyThrough](HasManyThrough-relation.md)
  - [HasOne](HasOne-relation.md)
  - [BelongsTo](BelongsTo-relation.md)

- Name of the source model (`sourceModel`). Prompts a list of available models
  to choose from as the source model of the relation.

- Name of the target model (`targetModel`). Prompts a list of available models
  to choose from as the target model of the relation.

- Name of the through model (`targetModel`). Prompts a list of available models
  to choose from as the through model of the relation. For HasManyThrough
  relation only.

- Name of the foreign key (`foreignKeyName`). Prompts a property name that
  references the primary key property of the another model. Note: Leave blank to
  use the default. For HasMany/BelongsTo/HasOne relations.

  Default values: `<sourceModel>` + `Id` in camelCase, e.g `categoryId`

- Name of the source key (`sourceKeyOnThrough`). Prompts a property name that
  references the source model to define on the through model. For HasManyThrough
  relation only. Default value: `<sourceModel>` + `Id` in camelCase, e.g
  `doctorId`.

- Name of the target key (`targetKeyOnThrough`). Prompts a property name that
  references the target model to define on the through model. For HasManyThrough
  relation only. Default value: `<targetModel>` + `Id` in camelCase, e.g
  `patientId`.

- Name of the relation (`relationName`). Prompts for the Source property name.
  Note: Leave blank to use the default. Default values:

  - plural form of `<targetModel>` for `hasMany` and `hasManyThrough` relations,
    e.g. `products`
  - singular form of `<targetModel>` for `hasOne` relations, e.g. `address`
  - for `belongsTo` relations, the default name is based on the foreign key of
    the `belongsTo` relation. E.g. when the foreign key is the default name,
    `categoryId` for example, the default relation name is `category`.

{% include warning.html content="Based on your input, the default foreign key name might be the same as the default relation name, especially for belongsTo relation. Please name them differently to avoid a known issue [Navigational Property Error](https://github.com/strongloop/loopback-next/issues/4392)
" lang=page.lang %}

The generator has some limitations. It only asks the most basic factors for
generating relations. For example, it uses the id property as the source key.
LB4 allows you customize the source key name, the foreign key name, the relation
name, and even the DB column name. Check the
[Relation Metadata](HasMany-relation.md#relation-metadata) section in each
relation to learn how you can define relations.

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
