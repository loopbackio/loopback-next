---
lang: en
title: 'Add a Datasource'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/todo-tutorial-datasource.html
summary: LoopBack 4 Todo Application Tutorial - Add a Datasource
---

### Datasources

Datasources are LoopBack's way of connecting to various sources of data, such as
databases, APIs, message queues and more. A `DataSource` in LoopBack 4 is a
named configuration for a Connector instance that represents data in an external
system. The Connector is used by `legacy-juggler-bridge` to power LoopBack 4
Repositories for Data operations.

In LoopBack 4, datasources can be represented as strongly-typed objects and
freely made available for [injection](../../Dependency-injection.md) throughout
the application. Typically, in LoopBack 4, datasources are used in conjunction
with [Repositories](../../Repositories.md) to provide access to data.

For more information about datasources in LoopBack, see
[DataSources](https://loopback.io/doc/en/lb4/DataSources.html).

Since our Todo API will need to persist instances of Todo items, we'll need to
create a datasource definition to make this possible.

### Building a Datasource

From inside the project folder, we'll run the `lb4 datasource` command to create
a DataSource. For the purposes of this tutorial, we'll be using the memory
connector provided with the Juggler.

```sh
lb4 datasource
? Datasource name: db
? Select the connector for db: In-memory db (supported by StrongLoop)
? window.localStorage key to use for persistence (browser only):
? Full path to file for persistence (server only): ./data/db.json

  create src/datasources/db.datasource.json
  create src/datasources/db.datasource.ts
  update src/datasources/index.ts

Datasource Db was created in src/datasources/
```

Create a `data` folder in the applications root and add a new file called
`db.json` containing an example database.

{% include code-caption.html content="data/db.json" %}

```json
{
  "ids": {
    "Todo": 5
  },
  "models": {
    "Todo": {
      "1": "{\"title\":\"Take over the galaxy\",\"desc\":\"MWAHAHAHAHAHAHAHAHAHAHAHAHAMWAHAHAHAHAHAHAHAHAHAHAHAHA\",\"id\":1}",
      "2": "{\"title\":\"destroy alderaan\",\"desc\":\"Make sure there are no survivors left!\",\"id\":2}",
      "3": "{\"title\":\"play space invaders\",\"desc\":\"Become the very best!\",\"id\":3}",
      "4": "{\"title\":\"crush rebel scum\",\"desc\":\"Every.Last.One.\",\"id\":4}"
    }
  }
}
```

{% include note.html content="If you are using a relational database as the
datasource, don't forget to create the corresponding table or follow the
[Database migration instruction](https://loopback.io/doc/en/lb4/Database-migrations.html) to get it created programmatically.
" %}

Once you're ready, we'll move onto adding a
[repository](todo-tutorial-repository.md) for the datasource.

### Navigation

Previous step: [Add your Todo model](todo-tutorial-model.md)

Next step: [Add a repository](todo-tutorial-repository.md)
