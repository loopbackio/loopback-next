---
lang: en
title: 'Add Model Relations'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/todo-list-tutorial-relations.html
summary: LoopBack 4 TodoList Application Tutorial - Add TodoList Repository
---

### Define the model relation

We are going to add the model relation to indicate the relation that `TodoList`
_hasMany_ `Todo` using the
[`lb4 relation` command](https://loopback.io/doc/en/lb4/Relation-generator.html).

```sh
$ lb4 relation
? Please select the relation type hasMany
? Please select source model TodoList
? Please select target model Todo
? Foreign key name to define on the target model todoListId
? Source property name for the relation getter todos
? Allow TodoList queries to include data from related Todo instances? Yes
   create src/controllers/todo-list-todo.controller.ts

Relation HasMany was created in src/
```

Now, we're going to add the relation for `Todo`. That is, `Todo` _belongsTo_
`TodoList`.

```sh
$ lb4 relation
? Please select the relation type belongsTo
? Please select source model Todo
? Please select target model TodoList
? Source property name for the relation getter todoListId
? Allow Todo queries to include data from related TodoList instances? Yes
   create src/controllers/todo-todo-list.controller.ts

Relation BelongsTo was created in src/
```

{% include note.html content="
we use **default** foreign key and source property names in this case.
If you'd like to customize them, please check `Relation Metadata`
https://loopback.io/doc/en/lb4/HasMany-relation.html#relation-metadata and other
relations as well.
" %}

### Behind the scene

If you want to understand the code changes introduced from the relation
generator command, read on the details in this section; otherwise, you are ready
to move to the next step to create the controller.

#### Relation decorators

When we added the `hasMany` relation using the `lb4 relation` command, it added
the `@hasMany()` decorator together with the `todos` property. As the
decorator's name suggests, `@hasMany()` informs LoopBack 4 that a todo list can
have many todo items.

```ts
export class TodoList extends Entity {
  // ...properties defined by the CLI...

  @hasMany(() => Todo)
  todos?: Todo[];

  // ...constructor def...
}
```

Similarly for the `belongsTo` relation:

```ts
export class Todo extends Entity {
  // ...properties of the Todo model

  @belongsTo(() => TodoList)
  todoListId: number;

  // ...constructor def...
}
```

#### Inclusion of Related Models

When we ran the `lb4 relation` command, we accepted the default of `Yes` to the
prompt:

```sh
? Allow Order queries to include data from related Customer instances? (Y/n)
```

This registers the `inclusionResolver` for the relation(s) you were working with
above.

Make sure to choose ‘yes’ if you’d like to use inclusion and your model is
traversable. In the example of getting the related `Todo` objects for each
`TodoList`, it registers the inclusion resolver that comes with the
[`HasManyRepositoryFactory`](https://loopback.io/doc/en/lb4/apidocs.repository.hasmanyrepository.html).

Let's take a closer look at the `TodoListRepository`.
{% include code-caption.html content="src/repositories/todo-list.repository.ts" %}

```ts
this.todos = this.createHasManyRepositoryFactoryFor(
  'todos',
  todoRepositoryGetter,
);
// this line enables inclusion for this relation
this.registerInclusionResolver('todos', this.todos.inclusionResolver);
```

As a result, when you get a `TodoList`, a `todos` property will be included that
contains your related `Todo`s, for example:

```json
{
  "id": 2,
  "title": "My daily chores",
  "todos": [
    {
      "id": 3,
      "title": "play space invaders",
      "desc": "Become the very best!",
      "todoListId": 2
    }
  ]
}
```

On the other end,
[`BelongsToAccessor`](https://loopback.io/doc/en/lb4/apidocs.repository.belongstoaccessor.html)
also comes with an inclusion resolver function that we can register on the
`TodoRepository`.

{% include code-caption.html content="src/repositories/todo.repository.ts" %}

```ts
this.todoList = this.createBelongsToAccessorFor(
  'todoList',
  todoListRepositoryGetter,
);
// this line enables inclusion for this relation
this.registerInclusionResolver('todoList', this.todoList.inclusionResolver);
```

### Navigation

Previous step: [Add TodoList Repository](todo-list-tutorial-repository.md)

Last step: [Add TodoList Controller](todo-list-tutorial-controller.md)
