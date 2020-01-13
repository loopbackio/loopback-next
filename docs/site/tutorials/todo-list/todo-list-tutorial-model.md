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
? Please select the model base class Entity (A persisted model with an ID)
? Allow additional (free-form) properties? No
Model TodoList will be created in src/models/todo-list.model.ts

Let's add a property to TodoList
Enter an empty property name when done

? Enter the property name: id
? Property type: number
? Is id the ID property? Yes
? Is id generated automatically? No
? Is it required?: No
? Default value [leave blank for none]:

Let's add another property to TodoList
Enter an empty property name when done

? Enter the property name: title
? Property type: string
? Is it required?: Yes
? Default value [leave blank for none]:

Let's add another property to TodoList
Enter an empty property name when done

? Enter the property name: color
? Property type: string
? Is it required?: No
? Default value [leave blank for none]:

Let's add another property to TodoList
Enter an empty property name when done

? Enter the property name:
   create src/models/todo-list.model.ts
   update src/models/index.ts

Model TodoList was created in src/models/
```

To view the completed file, see the
[`TodoList` example](https://github.com/strongloop/loopback-next/blob/master/examples/todo-list/src/models/todo-list.model.ts).

Once the models have been completely configured, it's time to move on to adding
a [repository](todo-list-tutorial-repository.md) for `TodoList`.

### Navigation

Introduction: [TodoList Tutorial](todo-list-tutorial.md)

Next step: [Add TodoList repository](todo-list-tutorial-repository.md)
