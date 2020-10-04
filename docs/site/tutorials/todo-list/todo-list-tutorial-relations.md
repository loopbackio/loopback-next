---
lang: en
title: 'Add Model Relations'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Tutorial
sidebar: lb4_sidebar
permalink: /doc/en/lb4/todo-list-tutorial-relations.html
summary: LoopBack 4 TodoList Application Tutorial - Add TodoList Repository
---

### Define the model relation

We are going to add the model relation to indicate the relation that `TodoList`
_hasMany_ `Todo` using the
[`lb4 relation` command](../../Relation-generator.md).

```sh
$ lb4 relation
? Please select the relation type hasMany
? Please select source model TodoList
? Please select target model Todo
? What is the name of ID property of the source model? id
? What is the type of the source model primary key? number
? What is the name of ID property of the target model? id
? What is the type of the target model primary key? number
? Foreign key name to define on the target model todoListId
? Source property name for the relation getter (will be the relation name) todos
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
? What is the name of ID property of the source model? id
? What is the type of the source model primary key? number
? What is the name of ID property of the target model? id
? What is the type of the target model primary key? number
? Foreign key name to define on the source model todoListId
? Relation name todoList
? Allow Todo queries to include data from related TodoList instances? Yes
   create src/controllers/todo-todo-list.controller.ts

Relation BelongsTo was created in src/
```

{% include note.html content="
We use **default** foreign key and source property names in this case.
If you'd like to customize them, please check [Relation Metadata](../../HasMany-relation.md#relation-metadata) and other
relations as well.
" %}

### Update Sample Data

Now that we have the relations between the `Todo` and `TodoList` models, we can
update the data we have in `data/db.json` to reflect this relation.

First let's add two sample `TodoList`s:

```json
{
  "ids": {
    "Todo": 5,
    "TodoList": 3
  },
  "models": {
    "Todo": {
      "1": "{\"title\":\"Take over the galaxy\",\"desc\":\"MWAHAHAHAHAHAHAHAHAHAHAHAHAMWAHAHAHAHAHAHAHAHAHAHAHAHA\",\"id\":1}",
      "2": "{\"title\":\"destroy alderaan\",\"desc\":\"Make sure there are no survivors left!\",\"id\":2}",
      "3": "{\"title\":\"play space invaders\",\"desc\":\"Become the very best!\",\"id\":3}",
      "4": "{\"title\":\"crush rebel scum\",\"desc\":\"Every.Last.One.\",\"id\":4}"
    },
    "TodoList": {
      "1": "{\"title\":\"Sith lord's check list\",\"lastModified\":\"a long time ago\",\"id\":1}",
      "2": "{\"title\":\"My daily chores\",\"lastModified\":\"2018-07-13\",\"id\":2}"
    }
  }
}
```

Next, let's add a `todoListId` property to the `Todo`s with the `id`s of the new
`TodoList`s we added:

```json
{
  "ids": {
    "Todo": 5,
    "TodoList": 3
  },
  "models": {
    "Todo": {
      "1": "{\"title\":\"Take over the galaxy\",\"desc\":\"MWAHAHAHAHAHAHAHAHAHAHAHAHAMWAHAHAHAHAHAHAHAHAHAHAHAHA\",\"todoListId\":1,\"id\":1}",
      "2": "{\"title\":\"destroy alderaan\",\"desc\":\"Make sure there are no survivors left!\",\"todoListId\":1,\"id\":2}",
      "3": "{\"title\":\"play space invaders\",\"desc\":\"Become the very best!\",\"todoListId\":2,\"id\":3}",
      "4": "{\"title\":\"crush rebel scum\",\"desc\":\"Every.Last.One.\",\"todoListId\":1,\"id\":4}"
    },
    "TodoList": {
      "1": "{\"title\":\"Sith lord's check list\",\"lastModified\":\"a long time ago\",\"id\":1}",
      "2": "{\"title\":\"My daily chores\",\"lastModified\":\"2018-07-13\",\"id\":2}"
    }
  }
}
```

### Behind the scenes

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
  todos: Todo[];

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

You'll notice there's a `TodoRelations` interface in the `Todo` model class file
as well as a `TodoWithRelations` type defined.

{% include code-caption.html content="src/models/todo.model.ts" %}

```ts
export interface TodoRelations {
  // describe navigational properties here
}

export type TodoWithRelations = Todo & TodoRelations;
```

In the `TodoRelations` interface, we want to describe a `todoList` as a
navigational property. We can do that as follows:

{% include code-caption.html content="src/models/todo.model.ts" %}

```ts
// add TodoListWithRelations to the following import
import {TodoList, TodoListWithRelations} from './todo-list.model';
```

```ts
export interface TodoRelations {
  // add the following line
  todoList?: TodoListWithRelations;
}
```

Let's add a `todo` navigational property to the `TodoList` model as well:

{% include code-caption.html content="src/models/todo-list.model.ts" %}

```ts
// add TodoWithRelations to the following import
import {Todo, TodoWithRelations} from './todo.model';
```

```ts
export interface TodoRelations {
  // add the following line
  todos?: TodoWithRelations[];
}
```

Further, when we ran the `lb4 relation` command, we accepted the default of
`Yes` to the prompt:

```sh
? Allow Todo queries to include data from related TodoList instances? (Y/n)
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

There's an additional relation type LoopBack 4 supports, which is
[`hasOne`](../../HasOne-relation.md). If you're interested in trying it out, see
[Add TodoListImage Relation](todo-list-tutorial-has-one-relation.md). This is
not required for the application, so if you'd like to skip it, see the
[navigation](#navigation) for the last step.

### Navigation

Previous step: [Add TodoList Repository](todo-list-tutorial-repository.md)

Last step: [Add TodoList Controller](todo-list-tutorial-controller.md)
