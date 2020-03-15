---
lang: en
title: 'Discovering models from relational databases'
keywords: LoopBack 4.0, LoopBack-Next
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Discovering-models.html
---

## Synopsis

LoopBack makes it simple to create models from an existing relational database.
This process is called _discovery_ and is supported by the following connectors:

- Cassandra
- MySQL
- Oracle
- PostgreSQL
- SQL Server
- IBM DashDB
- IBM Db2 (for Linux, Unix, Windows)
- IBM Db2 for i
- IBM Db2 for z/OS
- [SAP HANA](https://www.npmjs.org/package/loopback-connector-saphana) - Not
  officially supported;

## Overview

Models can be discovered from a supported datasource by running the
`lb4 discover` command.

{% include important.html content="The LoopBack project must be built with
`npm run build` to transpile the datasource files to `/dist/datasources/*.js`."
%}

### Options

`--dataSource`: Put a valid datasource name here to skip the datasource prompt

`--views`: Choose whether to discover views. Default is true

`--all`: Skips the model prompt and discovers all of them

`--outDir`: Specify the directory into which the `model.model.ts` files will be
placed. Default is `src/models`

`--schema`: Specify the schema which the datasource will find the models to
discover

### Interactive Prompts

Based on the option, the tool may prompt you for:

- **Name of the connector to discover**: Prompts a list of available
  connectors(datasources) to choose.
- **Name of the models to discover**: Prompts choices of available models. The
  answer can be multiple.
- **Database column naming convention**: By default, LoopBack converts
  discovered model properties to `camelCase`. This is recommended. You can
  choose to keep them the same as the database column names. However, we
  recommend to use LoopBack default convention. You might need to specify the
  discovered property names in relation definition later. Check the
  [Relation Metadata](HasMany-relation.md#relation-metadata) section in each
  relation for details of customizing names.

### Output

Once all the prompts have been answered, the CLI will generate selected models.
Let's take PostgreSQL connector as an example. The generated models look like
the following:

```ts
@model({
  settings: {
    postgresql: {schema: 'public', table: 'mymodel'},
  },
})
export class My extends Entity {
  @property({
    type: 'number',
    required: false,
    scale: 0,
    id: true,
    postgresql: {
      columnName: 'my_id',
      dataType: 'integer',
      ...
    },
  })
  my_id: number;

  @property({
    type: 'string',
    required: true,
    length: 100,
    postgresql: {
      columnName: 'my_name',
      dataType: 'character varying',
      dataLength: 100,
      ...
    },
  })
  my_name: string;
```

Database column names can be different from property names. It can simply be
done by modifying the property name as long as the property has the
`<connector name>.columnName` field defined, which matches the column name in
the database: (Since LB4 prefers camel case, it is recommended to name
properties in camel case)

```ts
@model({
  settings: {
    postgresql: {schema: 'public', table: 'mymodel'},
  },
})
export class MyModel extends Entity {
  @property({
    type: 'number',
    required: false,
    scale: 0,
    id: 1,
    postgresql: {
      columnName: 'my_id',
      dataType: 'integer',
      ...
    },
  })
  myId: number; // different from the column name

  @property({
    type: 'string',
    required: true,
    length: 100,
    postgresql: {
      columnName: 'my_name',
      dataType: 'character varying',
      dataLength: 100,
      ...
    },
  })
  myName: string; // different from the column name
```
