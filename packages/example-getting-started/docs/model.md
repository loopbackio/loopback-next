### Models

Now we can begin working on the representation of our data for use with
LoopBack 4. To that end, we're going to create a Todo model that can represent
instances of a task for our Todo list. The Todo model will serve both as a
[Data Transfer Object](https://en.wikipedia.org/wiki/Data_transfer_object) (also
known as a DTO) for representing incoming Todo instances on requests, as well as
our data structure for use with the Legacy Juggler.

> **NOTE:** LoopBack 3 treated models as the "center" of operations; in LoopBack
> 4, that is no longer the case. While LoopBack 4 provides many of the helper
> methods and decorators that allow you to utilize models in a similar way, you
> are no longer _required_ to do so!

### Building your Todo model

A todo list is all about tracking tasks. For this to be useful, it will need to
let you label tasks so that you can distinguish between them, add extra
information to describe those tasks, and finally, provide a way of tracking
whether or not they're complete.

For our Todo model to represent our Todo instances, it will need:

- a unique id
- a title
- a description that details what the todo is all about
- a boolean flag for whether or not we've completed the task

Inside the `src/models` folder, create two files:

- `index.ts`
- `todo.model.ts`

> **NOTE:**
> The `index.ts` file is an export helper file; this pattern is a huge time-saver
> as the number of models in your project grows, because it allows you to point
> to the _directory_ when attempting to import types from a file within the target
> folder. **We will use this concept throughout the tutorial! For more info,
> see TypeScript's [Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html) docs.**

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
// Using an index.ts in your artifact folders really helps keep
// things tidy and succinct!
```

For the Legacy Juggler to understand how to work with our model class, it will
need to extend the `Entity` type, as well as provide an override for the `getId`
function, so that it can retrieve a Todo model's ID as needed.

#### src/models/todo.model.ts

```ts
import {Entity, property, model} from '@loopback/repository';

@model()
export class Todo extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  title: string;

  @property({
    type: 'string',
  })
  desc?: string;

  @property({
    type: 'boolean',
  })
  isComplete: boolean;

  getId() {
    return this.id;
  }
}
```

Now that we have our model, it's time to add a [datasource](datasource.md) so we
can perform real CRUD operations!

### Navigation

Previous step: [Adding the Legacy Juggler](juggler.md)

Next step: [Add a datasource](datasource.md)
