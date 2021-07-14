---
lang: en
title: 'Creating Models at Runtime'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Model
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Creating-model-runtime.html
summary: Create LoopBack Models at runtime
---

Models can also be created at runtime using the `defineModelClass()` helper
function from the `@loopback/repository` class. It expects a base model to
extend (typically `Model` or `Entity`), followed by a `ModelDefinition` object
as shown in the example below.

```ts
const bookDef = new ModelDefinition('Book')
  .addProperty('id', {type: 'number', id: true})
  .addProperty('title', {type: 'string'});
const BookModel = defineModelClass<typeof Entity, {id: number; title?: string}>(
  Entity, // Base model
  bookDef, // ModelDefinition
);
```

You will notice that we are specifying generic parameters for the
`defineModelClass()` function. The first parameter is the base model, the second
one is an interface providing the TypeScript description for the properties of
the model we are defining. If the interface is not specified, the generated
class will have only members inherited from the base model class, which
typically means no properties.

In case you need to use an existing Model as the base class, specify the Model
as the base class instead of `Entity`.

```ts
// Assuming User is a pre-existing Model class in the app
import {User} from './user.model';
import DynamicModelCtor from '@loopback/repository';
const StudentModel = defineModelClass<
  typeof User,
  // id being provided by the base class User
  {university?: string}
>(User, studentDef);
```

If you want make this new Model available from other parts of the app, you can
call `app.model(StudentModel)` to create a binding for it.

{% include note.html content="
The `app.model()` method is available only on application classes with
`RepositoryMixin` applied.
" %}
