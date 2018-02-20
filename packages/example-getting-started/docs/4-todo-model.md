### Building the Todo model

The Todo model will be the object we use both as a Data Transfer Object (DTO) on
the controller, and as a LoopBack model for the Legacy Juggler implementation.

Create another folder in `src` called `repositories` and inside of that folder,
create two files:
- `index.ts`
- `todo.repository.ts`

>**NOTE:**
The `index.ts` file is an export helper file; this pattern is a huge time-saver
as the number of models in your project grows, because it allows you to point
to the _directory_ when attempting to import types from a file within the target
folder. We will use this concept throughout the tutorial!
```ts
// in src/models/index.ts
export * from './foo.model';
export * from './bar.model';
export * from './baz.model';

// elsewhere...

// with index.ts
import {Foo, Bar, Baz} from './models';
// ...and without index.ts
import {Foo} from './models/foo.model';
import {Bar} from './models/bar.model';
import {Baz} from './models/baz.model';
```

In our Todo model, we'll create a basic representation of what would go in
a Todo list. Our model will include:
- a unique id
- a title
- a description that details what the todo is all about
- a boolean flag for whether or not we've completed the task.

For the Legacy Juggler to understand how to work with our model class, it
will need to extend the `Entity` type, as well as provide an override for
the `getId` function, so that it can retrieve a Todo model's ID as needed.

Additionally, we'll define a `SchemaObject` that represents our Todo model
as an [OpenAPI Schema Object](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#schema-object).
This will give the OpenAPI spec builder the information it needs to describe the
Todo model on your app's OpenAPI endpoints.

#### src/models/todo.model.ts
```ts
import {Entity, property, model} from '@loopback/repository';
import {SchemaObject} from '@loopback/openapi-spec';

@model()
export class Todo extends Entity {
  @property({
    type: 'number',
    id: true
  })
  id?: number;

  @property({
    type: 'string',
    required: true
  })
  title: string;

  @property({
    type: 'string'
  })
  desc?: string;

  @property({
    type: 'boolean'
  })
  isComplete: boolean;

  getId() {
    return this.id;
  }
}

export const TodoSchema: SchemaObject = {
  title: 'todoItem',
  properties: {
    id: {
      type: 'number',
      description: 'ID number of the Todo entry.'
    },
    title: {
      type: 'string',
      description: 'Title of the Todo entry.'
    },
    desc: {
      type: 'number',
      description: 'ID number of the Todo entry.'
    },
    isComplete: {
      type: 'boolean',
      description: 'Whether or not the Todo entry is complete.'
    }
  },
  required: ['title'],
};
```
### Navigation

Previous step: [Adding the Legacy Juggler](3-add-legacy-juggler.html)
Next step: [Add a datasource](5-datasource.html)
