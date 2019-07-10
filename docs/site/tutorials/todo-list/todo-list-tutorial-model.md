---
lang: en
title: 'Add TodoList Model'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/todo-list-tutorial-model.html
summary: LoopBack 4 TodoList Application Tutorial - Add TodoList Model
---

### Building a checklist for your Todo models

A todo item is often grouped into a checklist along with other todo items so
that it can be used to measure the progress of a bigger picture.

A data set can often be related to another data set, so that an entity may be
able to provide access to another entity based on its relationship with the
other entity. To take `TodoListApplication` one step further and establish
relations with the existing `Todo` model as real-world applications often tend
to do, we'll introduce the model `TodoList`.

We'll create the `TodoList` model to represent a checklist that contains
multiple Todo items. Let's define TodoList model with the following properties:

- a unique id
- a title
- a color to represent the TodoList with

We can use the `lb4 model` command and answer the prompts to generate the model
for us as follows:

```sh
$ lb4 model
? Model class name: TodoList
? Please select the model base class Entity
? Allow additional (free-form) properties? No
Model TodoList will be created in src/models/todo-list.model.ts

Let's add a property to TodoList
Enter an empty property name when done

? Enter the property name: id
? Property type: number
? Is ID field? Yes
? Required?: No
? Default value [leave blank for none]:

Let's add another property to TodoList
Enter an empty property name when done

? Enter the property name: title
? Property type: string
? Required?: Yes
? Default value [leave blank for none]:

Let's add another property to TodoList
Enter an empty property name when done

? Enter the property name: color
? Property type: string
? Required?: No
? Default value [leave blank for none]:

Let's add another property to TodoList
Enter an empty property name when done

? Enter the property name:
   create src/models/todo-list.model.ts
   update src/models/index.ts

Model TodoList was created in src/models/
```

Now that we have our new model, we need to define its relation with the `Todo`
model. Add the following import statements and property to the `TodoList` model
and update the `TodoListRelations` interface to include `todos`:

{% include code-caption.html content="src/models/todo-list.model.ts" %}

```ts
import {hasMany} from '@loopback/repository';
import {Todo, TodoWithRelations} from './todo.model';

@model()
export class TodoList extends Entity {
  // ...properties defined by the CLI...

  @hasMany(() => Todo)
  todos?: Todo[];

  // ...constructor def...
}

export interface TodoListRelations {
  todos?: TodoWithRelations[];
}

export type TodoListWithRelations = TodoList & TodoListRelations;
```

The `@hasMany()` decorator defines this property. As the decorator's name
suggests, `@hasMany()` informs LoopBack 4 that a todo list can have many todo
items.

To complement `TodoList`'s relationship to `Todo`, we'll add in the `todoListId`
property on the `Todo` model to define the relation on both ends, along with
updating the `TodoRelations` interface to include `todoList`:

{% include code-caption.html content="src/models/todo.model.ts" %}

```ts
@model()
export class Todo extends Entity {
  // ...properties defined by the CLI...

  @belongsTo(() => TodoList)
  todoListId: number;

  // ...constructor def...
}

export interface TodoRelations {
  todoList?: TodoListWithRelations;
}

export type TodoWithRelations = Todo & TodoRelations;
```

Once the models have been completely configured, it's time to move on to adding
a [repository](todo-list-tutorial-repository.md) for `TodoList`.

### Navigation

Introduction: [TodoList Tutorial](todo-list-tutorial.md)

Next step: [Add TodoList repository](todo-list-tutorial-repository.md)
