---
lang: en
title: 'Add TodoListImage Relation'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Tutorial
sidebar: lb4_sidebar
permalink: /doc/en/lb4/todo-list-tutorial-has-one-relation.html
summary: LoopBack 4 TodoList Application Tutorial - Add TodoListImage Relation
---

We have that a `Todo` [`belongsTo`](../../BelongsTo-relation.md) a `TodoList`
and a `TodoList` [`hasMany`](../../HasMany-relation.md) `Todo`s. Another type of
relation we can add is [`hasOne`](../../HasOne-relation.md). To do so, let's add
`TodoListImage` such that each `TodoList` `hasOne` image. In parallel, a
`TodoListImage` will belong to a `TodoList`, similar to how a `Todo` belongs to
`TodoList`.

### Create the Model

Similar to how we created the model for
[`TodoList`](todo-list-tutorial-model.md), using `lb4 model`:

```sh
lb4 model
? Model class name: TodoListImage
? Please select the model base class Entity (A persisted model with an ID)
? Allow additional (free-form) properties? No
Model TodoListImage will be created in src/models/todo-list-image.model.ts

Let's add a property to TodoListImage
Enter an empty property name when done

? Enter the property name: id
? Property type: number
? Is id the ID property? Yes
? Is id generated automatically? No
? Is it required?: No
? Default value [leave blank for none]:

Let's add another property to TodoListImage
Enter an empty property name when done

? Enter the property name: value
? Property type: string
? Is it required?: Yes
? Default value [leave blank for none]:

Let's add another property to TodoListImage
Enter an empty property name when done

? Enter the property name:
   create src/models/todo-list-image.model.ts
   update src/models/index.ts

Model TodoListImage was created in src/models/
```

### Create the Repository

Using `lb4 repository`, let's create the repository:

```sh
lb4 repository
? Please select the datasource DbDatasource
? Select the model(s) you want to generate a repository TodoListImage
? Please select the repository base class DefaultCrudRepository (Juggler bridge)
   create src/repositories/todo-list-image.repository.ts
   update src/repositories/index.ts

Repository TodoListImageRepository was created in src/repositories/
```

### Add the Relation

Adding a [`hasOne` relation](../../HasOne-relation.md) is similar to the HasMany
relation. Let's use the [`lb4 relation` command](../../Relation-generator.md).

```sh
$ lb4 relation
? Please select the relation type hasOne
? Please select source model TodoList
? Please select target model TodoListImage
? Foreign key name to define on the target model todoListId
? Source property name for the relation getter (will be the relation name) image
? Allow TodoList queries to include data from related TodoListImage instances? Yes
   create src/controllers/todo-list-todo-list-image.controller.ts

Relation HasMany was created in src/
```

Now, we're going to add the relation for `TodoListImage`. That is,
`TodoListImage` _belongsTo_ `TodoList`:

```sh
$ lb4 relation
? Please select the relation type belongsTo
? Please select source model TodoListImage
? Please select target model TodoList
? Foreign key name to define on the source model todoListId
? Relation name todoList
? Allow TodoListImage queries to include data from related TodoList instances? Yes
   create src/controllers/todo-list-image-todo-list.controller.ts

Relation BelongsTo was created in src/
```

Then you should see the new added property `image` is decorated with the
decorator `@hasOne` in the `TodoList` to represent the `TodoListImage` this
`TodoList` has:

{% include code-caption.html content="src/models/todo-list.model.ts" %}

```ts
import {hasOne} from '@loopback/repository';
import {
  TodoListImage,
  TodoListImageWithRelations,
} from './todo-list-image.model';

@model()
export class TodoList extends Entity {
  // ... other properties

  @hasOne(() => TodoListImage)
  image: TodoListImage;

  // ...
}

export interface TodoListRelations {
  todos?: TodoWithRelations[];

  // Add the following line
  image?: TodoListImageWithRelations;
}
```

If you check the `TodoListImage` model, you will find that the foreign key
`todoListId` is being added and decorated with `@belongsTo`:
{% include code-caption.html content="src/models/todo-list-image.model.ts" %}

```ts
import {belongsTo} from '@loopback/repository';
import {TodoList, TodoListWithRelations} from './todo-list.model';

@model()
export class TodoListImage extends Entity {
  // ... other properties

  @belongsTo(() => TodoList)
  todoListId: number;

  // ...
}

export interface TodoListImageRelations {
  todoList?: TodoListWithRelations;
}
```

Try to create instances and traverse the data as what we showed in the previous
step yourself!

{% include note.html content="
A `hasOne` relation from model A to model B does not need a `belongsTo` relation to exist from model B to model A.
" %}

{% include note.html content="
See the [`@hasOne`](../../HasOne-relation.md#relation-metadata) and [`@belongsTo`](../../BelongsTo-relation.md#relation-metadata) documentation for more information on how to customize the decorators.
" %}

### Navigation

Previous step: [Add TodoList Relations](todo-list-tutorial-relations.md)

Last step: [Add TodoList Controller](todo-list-tutorial-controller.md)
