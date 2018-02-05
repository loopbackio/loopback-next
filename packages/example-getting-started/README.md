# @loopback/example-getting-started

This is the basic tutorial for getting started with Loopback 4!

**NOTICE**: This tutorial is currently under construction! This notice will be
removed when it is ready for use!

## Prerequisites

Before we can begin, you'll need to make sure you have some things installed:
- [Node.js](https://nodejs.org/en/) at v6.x or greater

Additionally, this tutorial assumes that you are comfortable with
certain technologies, languages and concepts.
- JavaScript (ES6)
- [npm](https://www.npmjs.com/)
- [REST](https://en.wikipedia.org/wiki/Representational_state_transfer)

## Setup
1. Install the new loopback CLI toolkit.
```
npm i -g @loopback/cli
```
2. Download the "getting-started" application.
```
lb4 example getting-started
```

3. Switch to the directory and install dependencies.
```
cd loopback-example-getting-started && npm i
```

4. Start the app!
```
npm start
```

## Tutorial

Here's a step-by-step guide of how to build this repository!

### Create your app scaffolding
Install the `@loopback/cli` package. This will give you the command-line
toolkit that can generate a basic REST app for you.
`npm i -g @loopback/cli`

Next, navigate to whichever directory you'd like to create your new project
and run `lb4`. Follow the prompts to generate your application. For this
tutorial, when prompted with the options for selecting things like whether or
not to enable certain project features (loopback's build, tslint, mocha, etc.),
leave them all enabled.

<!-- TODO: Add screenshot of terminal here to illustrate what we mean. -->

### Adding Legacy Juggler Capabilities
Jump into the directory for your new application. You'll see a folder structure
similar to this:
```
dist\
node_modules\
src\
  controllers\
    ping.controller.ts
    README.md
  repositories\
    README.md
  application.ts
  index.ts
test\
  mocha.opts
  ping.controller.test.ts
  README.md
index.js
index.d.ts
index.ts
```

The application template comes with a controller, and some default wireup in
`src/application.ts` that handles the basic configuration for your application.
For this tutorial, we won't need `ping.controller.ts` or its corresponding test,
but you can leave them in for now.

Now that you have your setup, it's time to modify it to add in
`@loopback/repository`. Install this dependency by running
`npm i --save @loopback/repository`.

Next, modify `src/application.ts` to change the base class of your app to use
the `RepositoryMixin`:

#### src/application.ts
```ts
import {ApplicationConfig} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import {PingController} from './controllers/ping-controller';
import {Class, Repository, RepositoryMixin} from '@loopback/repository';

export class TodoApplication extends RepositoryMixin(RestApplication) {
  constructor(options?: ApplicationConfig) {
    super(options);
    this.setupControllers();
  }

  setupControllers() {
    this.controller(PingController);
  }
}
```

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

### Building a Datasource
Before we can begin constructing controllers and repositories for our
application, we need to define our datasource.

Create a new folder in the root directory of the project called `config`,
and then inside that folder, create a `datasources.json` file. For now, we'll
be using the memory connector provided with the Juggler.

#### config/datasources.json
```json
{
  "name": "ds",
  "connector": "memory"
}
```

Create another folder called `datasources` in the `src` directory, and inside
that folder, create a new file called `db.datasource.ts`.

#### src/datasources/db.datasource.ts

```ts
import * as path from 'path';
import * as fs from 'fs';
import { DataSourceConstructor, juggler } from '@loopback/repository';

const dsConfigPath = path.resolve('config', 'datasources.json');
const config = require(dsConfigPath);
export const db = new DataSourceConstructor(config);
```

This will give us a strongly-typed datasource export that we can work with to
construct our TodoRepository definition.

### Create your repository
Create another folder in `src` called `repositories` and inside of that folder,
create two files:
- `index.ts` (our export helper)
- `todo.repository.ts`

Our TodoRepository will contain a small base class that uses the
`DefaultCrudRepository` class from `@loopback/repository` and will define the
model type we're working with, as well as its ID type. We'll also inject our
datasource so that this repository can connect to it when executing data
operations.

#### src/repositories/todo.repository.ts
```ts
import { DefaultCrudRepository, DataSourceType } from '@loopback/repository';
import { Todo } from '../models';
import { inject } from '@loopback/core';

export class TodoRepository extends DefaultCrudRepository<
  Todo,
  typeof Todo.prototype.id
> {
  constructor(@inject('datasource') protected datasource: DataSourceType) {
    super(Todo, datasource);
  }
}
```


### Create your controller
Now, we'll create a controller to handle our Todo routes. Create the
`src/controllers` directory and two files inside:
- `index.ts` (export helper)
- `todo.controller.ts`

In addition to creating the CRUD methods themselves, we'll also be adding
decorators that setup the routing as well as the expected parameters of
incoming requests.

#### src/controllers/todo.controller.ts
```ts
import {post, param, get, put, patch, del, HttpErrors} from '@loopback/rest';
import {TodoSchema, Todo} from '../models';
import {repository} from '@loopback/repository';
import {TodoRepository} from '../repositories/index';

export class TodoController {
  constructor(
    @repository(TodoRepository.name) protected todoRepo: TodoRepository,
  ) {}
  @post('/todo')
  @param.body('todo', TodoSchema)
  async createTodo(todo: Todo) {
    if (!todo.title) {
      return Promise.reject(new HttpErrors.BadRequest('title is required'));
    }
    return await this.todoRepo.create(todo);
  }

  @get('/todo/{id}')
  @param.path.number('id')
  @param.query.boolean('items')
  async findTodoById(id: number, items?: boolean): Promise<Todo> {
    return await this.todoRepo.findById(id);
  }

  @get('/todo')
  async findTodos(): Promise<Todo[]> {
    return await this.todoRepo.find();
  }

  @put('/todo/{id}')
  @param.path.number('id')
  @param.body('todo', TodoSchema)
  async replaceTodo(id: number, todo: Todo): Promise<boolean> {
    return await this.todoRepo.replaceById(id, todo);
  }

  @patch('/todo/{id}')
  @param.path.number('id')
  @param.body('todo', TodoSchema)
  async updateTodo(id: number, todo: Todo): Promise<boolean> {
    return await this.todoRepo.updateById(id, todo);
  }

  @del('/todo/{id}')
  @param.path.number('id')
  async deleteTodo(id: number): Promise<boolean> {
    return await this.todoRepo.deleteById(id);
  }
}
```

### Putting it all together

Now that we've got all of our artifacts made, let's set them up in our
application!

We'll define a new helper function for setting up the repositories, as well
as adding in our new controller binding.

#### src/application.ts
```ts
import {ApplicationConfig} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import {TodoController, PingController} from './controllers';
import {
  Class,
  Repository,
  RepositoryMixin,
  DataSourceConstructor,
} from '@loopback/repository';
import {db} from './datasources/db.datasource';
import {TodoRepository} from './repositories';

export class TodoApplication extends RepositoryMixin(RestApplication) {
  constructor(options?: ApplicationConfig) {
    super(options);
    this.setupControllers();
    this.setupRepositories();
  }

  setupControllers() {
    this.controller(TodoController);
    this.controller(PingController);
  }

  setupRepositories() {
    // This will allow you to test your application without needing to
    // use the "real" datasource!
    const datasource =
      this.options && this.options.datasource
        ? new DataSourceConstructor(this.options.datasource)
        : db;
    this.bind('datasource').to(datasource);
    this.repository(TodoRepository);
  }
}
```

### Try it out
Now that your app is ready to go, try it out with your favourite REST client!
Start the app (`npm start`) and then make some REST requests:
- `POST /todo` with a body of `{ "title": "get the milk" }`
- `GET /todo/1` and see if you get your Todo object back.
- `PATCH /todo/1` with a body of `{ "desc": "need milk for cereal" }`

### Stuck?
Check out our [Gitter channel](https://gitter.im/strongloop/loopback) and ask
for help with this tutorial!

### Bugs/Feedback
Open an issue in this repository **OR** on [loopback-next](https://github.com/strongloop/loopback-next) and we'll take a look!
