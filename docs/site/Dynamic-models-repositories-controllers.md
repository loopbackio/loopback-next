---
lang: en
title: 'Dynamically adding models, repositories, and controllers during runtime'
keywords:
  LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Model, Repository,
  Controller, Tutorial
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Dynamic-models-repositories-controllers.html
---

## How to dynamically add models, repositories, and controllers during runtime

Typically, a LoopBack app's models, repositories, and controllers are defined as
static files in the project directory. However, there may be scenarios where all
or some of these might have to be created after the app starts, during runtime.

LoopBack provides the ability to dynamically create models, repositories, and
controllers during runtime. This document is an explanation of how to go about
doing it.

### Defining a ModelDefinition object

A `ModelDefinition` object is the first step to creating a LoopBack model, it is
an abstraction for specifying the various attributes of a LoopBack model. A
`ModelDefinition` object is instantiated by passing a name or a
[ModelDefinitionSyntax](./apidocs.repository.modeldefinitionsyntax.html#modeldefinitionsyntax-interface)
object describing the model's attributes to the `ModelDefinition`'s constructor.

An example of creating a `ModelDefinition` object:

```ts
const bookDef = new ModelDefinition({
  name: 'book',
  properties: {
    id: {
      type: 'Number',
      required: true,
      length: null,
      precision: 10,
      scale: 0,
      id: 1,
      mysql: {
        columnName: 'id',
        dataType: 'int',
        dataLength: null,
        dataPrecision: 10,
        dataScale: 0,
        nullable: 'N',
      },
    },
    title: {
      type: 'String',
      required: false,
      length: 512,
      precision: null,
      scale: null,
      mysql: {
        columnName: 'title',
        dataType: 'varchar',
        dataLength: 512,
        dataPrecision: null,
        dataScale: null,
        nullable: 'Y',
      },
    },
  },
  settings: {
    idInjection: false,
    mysql: {schema: 'test', table: 'BookStore'},
  },
});
```

### Defining a Model

A LoopBack model class is created by passing a `ModelDefinition` object to
`@loopback/repository`'s helper function `defineModelClass()`. It expects a base
model to extend (typically `Model` or `Entity`), folowed by the model definition
object. In this case it will be `Entity`.

```ts
const BookModel = defineModelClass<typeof Entity, {id: number; title?: string}>(
  Entity,
  bookDef,
);
```

In case you need to use an existing Model as the base class, specify the Model
as the base class instead of `Entity`.

```ts
import DynamicModelCtor from '@loopback/repository';
// Assuming User is a pre-existing Model class in the app
const StudentModel = defineModelClass<
  typeof User,
  {id: number; university?: string}
>(User, studentDef);
```

For details about `ModelDefinition`, `defineModelClass`, `Model`, `Entity`, and
`DynamicModelCtor` refer to the
[@loopback/repository API documentation](./apidocs.repository.html).

### Defining a Datasource

Before a repository for this model can be set up, a datasource should be ready.
If required, set one up dynamically by creating an instance of
`juggler.DataSource`. It requires a name for the datasource, the connector, and
a connection url as shown below.

```ts
const dsName = 'bookstore-ds';
const bookDs = new juggler.DataSource({
  name: dsName,
  connector: require('loopback-connector-mongodb'),
  url: 'mongodb://sysop:moon@localhost',
});
await bookDs.connect();
app.dataSource(bookDs, dsName);
```

To use the newly created datasource, call its `.connect()` method and attach it
to the app using `app.dataSource()` method. Note, this method will be available
only on `RepositoryMixin` apps.

### Defining a Repository

Now that a datasource is ready, a repository can be created for `BookModel`.

The `@loopback/rest-crud` package exports a helper function,
`defineCrudRepositoryClass`, this function creates a
`DefaultCrudRepository`-based repository class for a given model.

```ts
const BookRepository = defineCrudRepositoryClass<
  Book,
  typeof Book.prototype.id,
  BookRelations
>(BookModel);
```

In case you want to use a non-`DefaultCrudRepository` repository class or you
want to create a custom repository, use the `defineRepositoryClass()` helper
function instead. Pass a second parameter to this function as the base class for
the new repository.

There are two options for doing this:

#### 1. Using a base repository class

Create a base repository with your custom implementation, and then specify this
repository as the base class.

```ts
class MyRepoBase<
  E extends Entity,
  IdType,
  Relations extends object
> extends DefaultCrudRepository<E, IdType, Relations> {
  // Custom implementation
}

const BookRepositoryClass = defineRepositoryClass<
  typeof BookModel,
  MyRepoBase<BookModel, typeof BookModel.prototype.id, BookRelations>
>(BookModel, MyRepoBase);
```

#### 2. Using a Repository mixin

Create a repository mixin with your customization as shown in the "
[Defining A Repository Mixin Class Factory Function](https://loopback.io/doc/en/lb4/migration-models-mixins.html#defining-a-repository-mixin-class-factory-function)
" example, apply the mixin on the base repository class (e.g.
`DefaultCrudRepository`) then specify this combined repository as the base class
to be used.

```ts
const BookRepositoryClass = defineRepositoryClass<
  typeof BookModel,
  DefaultCrudRepository<
    BookModel,
    typeof BookModel.prototype.id,
    BookRelations
  > &
    FindByTitle<BookModel>
>(BookModel, FindByTitleRepositoryMixin(DefaultCrudRepository));
```

Dependency injection has to be configured for the datasource as shown below.

```ts
inject(`datasources.${dsName.name}`)(BookRepository, undefined, 0);
const repoBinding = app.repository(BookRepository);
```

Note, the `app.repository()` method will be available only on `RepositoryMixin`
apps.

### Defining a Controller

Once a repository is set up, a controller can be created for the model using the
`defineCrudRestController` helper function from the `@loopback/rest-crud`
package. It accepts a Model class and a `CrudRestControllerOptions` object. You
will also have to configure dependency injection for the controller by applying
the `inject` decorator manually.

```ts
const basePath = '/' + bookDef.name;
const BookController = defineCrudRestController(BookModel, {basePath});
inject(repoBinding.key)(BookController, undefined, 0);
```

The controller is then attached to the app by calling the `app.controller()`
method.

```ts
app.controller(BookController);
```

The new CRUD REST endpoints for the model will be available on the app now.

If you want a customized controller, you can create a copy of
`defineCrudRestController`'s
[implementation](https://github.com/strongloop/loopback-next/blob/00917f5a06ea8a51e1f452f228a6b0b7314809be/packages/rest-crud/src/crud-rest.controller.ts#L129-L269)
and modify it according to your requirements.

For details about `defineCrudRestController` and `CrudRestControllerOptions`,
refer to the [@loopback/rest-crud API documentation](./apidocs.rest-crud.html).

## Model discovery

Some datasource connectors provide methods for discovering model definitions
from existing database schema. The following APIs can be very useful when
defining LoopBack models dynamically.

```ts
// List database tables and/or views
const modelDefs = await ds.discoverModelDefinitions({views: true, limit: 20});

// List database columns for a given table/view
const modelProps = await ds.discoverModelProperties('PRODUCT');
const modelProps = await ds.discoverModelProperties('INVENTORY_VIEW', {
  owner: 'STRONGLOOP',
});

// List primary keys for a given table
const primaryKeys = await ds.discoverPrimaryKeys('INVENTORY');

// List foreign keys for a given table
const foreignKeys = await ds.discoverForeignKeys('INVENTORY');

// List foreign keys that reference the primary key of the given table
const exportedForeignKeys = ds.discoverExportedForeignKeys('PRODUCT');

// Create a model definition by discovering the given table
const schema = await ds.discoverSchema(table, {owner: 'STRONGLOOP'});
```

For more details, refer to the "
[LoopBack DataSource and Connector Guide](https://github.com/strongloop/loopback-datasource-juggler/blob/master/docs/datasource-connector.md)
".
