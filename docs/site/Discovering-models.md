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
- IBM DB2
- IBM DashDB
- IBM DB2 for z/OS
- [SAP HANA](https://www.npmjs.org/package/loopback-connector-saphana) - Not
  officially supported;

## Overview

Models can be discovered from a supported datasource by running the
`lb4 discover` command.

**The LoopBack project must be built and contain the built datasource files in
`PROJECT_DIR/dist/datasources/*.js`**

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
