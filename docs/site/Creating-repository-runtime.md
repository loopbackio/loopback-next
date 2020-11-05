---
lang: en
title: 'Creating Repositories at Runtime'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Repository
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Creating-repository-runtime.html
summary: Create LoopBack Repositories at runtime
---

Repositories can be created at runtime using the `defineCrudRepositoryClass`
helper function from the `@loopback/rest-crud` package. It creates
`DefaultCrudRepository`-based repository classes by default.

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

## 1. Using a base repository class

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

## 2. Using a Repository mixin

Create a repository mixin with your customization as shown in the
[Defining A Repository Mixin Class Factory Function](https://loopback.io/doc/en/lb4/migration-models-mixins.html#defining-a-repository-mixin-class-factory-function)
example, apply the mixin on the base repository class (e.g.
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

{% include note.html content="
The `app.repository()` method is available only on application classes
with `RepositoryMixin` applied.
" %}
