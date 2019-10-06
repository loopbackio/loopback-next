---
lang: en
title: 'Controller generator'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Controller-generator.html
---

{% include content/generator-create-app.html lang=page.lang %}

### Synopsis

Adds a new empty controller to a LoopBack application.

```sh
lb4 controller [options] [<name>]
```

### Options

`--controllerType` : Type of the controller.

Valid types are `BASIC` and `REST`. `BASIC` corresponds to an empty controller,
whereas `REST` corresponds to REST controller with CRUD methods.

{% include_relative includes/CLI-std-options.md %}

### Arguments

`<name>` - Optional name of the controller to create as an argument to the
command.  If provided, the tool will use that as the default when it prompts for
the name.

### Interactive Prompts

The tool will prompt you for:

- **Name of the controller.** If the name had been supplied from the command
  line, the prompt is skipped and the controller is built with the name from the
  command-line argument.
- **Type of the controller.** You can select from the following types:
  - **Empty Controller** - An empty controller definition
  - **REST Controller with CRUD Methods** - A controller wired up to a model and
    repository definition, with pre-defined CRUD methods.

#### Empty Controller

If you select the Empty Controller, it will generate a nearly-empty template
based on the given name:

```ts
// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';

export class FooController {
  constructor() {}
}
```

#### REST Controller with CRUD Methods

If you select the REST Controller with CRUD Methods type, you will then be asked
to select:

- The model to use for the CRUD function definitions
- The repository for this model that provides datasource connectivity
- The REST path name to host the endpoints on

The prompts that list out the models and repositories to choose from to build
the controller with are chosen from the existing model/repository files on disc.
From the LoopBack 4 project that the CLI is run in, the CLI tool will search for
the following files in the LoopBack 4 project it runs in:

- `src/repositories/*.repository.ts`
- `src/repositories/*.repository.js`
- `src/models/*.model.ts`
- `src/models/*.model.js`

Files that match these patterns will then be identified based on the string
before the first `.` separator. For example, file `models/product.model.ts` is
identified as a source of `Product` model.

{% include note.html content="
Please note that the model and repository typing information will be based on
how the model/repository files are named; the CLI tooling does not read the
actual artifact class names inside the files.
" %}

{% include warning.html content="
If you do not have a model and repository to select,
then you will receive an error!
" lang=page.lang %}

Here's an example of what the template will produce given a `Todo` model and a
`TodoRepository`:

```ts
import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getModelSchemaRef,
  getWhereSchemaFor,
  patch,
  del,
  requestBody,
} from '@loopback/rest';
import {Todo} from '../models';
import {TodoRepository} from '../repositories';

export class TodoController {
  constructor(
    @repository(TodoRepository) public todoRepository: TodoRepository,
  ) {}

  @post('/todos', {
    responses: {
      '200': {
        description: 'Todo model instance',
        content: {'application/json': {schema: getModelSchemaRef(Todo)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Todo, {title: 'NewTodo', exclude: ['id']}),
        },
      },
    })
    todo: Omit<Todo, 'id'>,
  ): Promise<Todo> {
    return this.todoRepository.create(todo);
  }

  @get('/todos/count', {
    responses: {
      '200': {
        description: 'Todo model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Todo)) where?: Where<Todo>,
  ): Promise<Count> {
    return this.todoRepository.count(where);
  }

  @get('/todos', {
    responses: {
      '200': {
        description: 'Array of Todo model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Todo)},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Todo))
    filter?: Filter<Todo>,
  ): Promise<Todo[]> {
    return this.todoRepository.find(filter);
  }

  @patch('/todos', {
    responses: {
      '200': {
        description: 'Todo PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Todo, {partial: true}),
        },
      },
    })
    todo: Partial<Todo>
    @param.query.object('where', getWhereSchemaFor(Todo)) where?: Where<Todo>,
  ): Promise<Count> {
    return this.todoRepository.updateAll(todo, where);
  }

  @get('/todos/{id}', {
    responses: {
      '200': {
        description: 'Todo model instance',
        content: {'application/json': {schema: getModelSchemaRef(Todo)}},
      },
    },
  })
  async findById(@param.path.number('id') id: number): Promise<Todo> {
    return this.todoRepository.findById(id);
  }

  @patch('/todos/{id}', {
    responses: {
      '204': {
        description: 'Todo PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Todo, {partial: true}),
        },
      },
    })
    todo: Partial<Todo>,
  ): Promise<void> {
    await this.todoRepository.updateById(id, todo);
  }

  @del('/todos/{id}', {
    responses: {
      '204': {
        description: 'Todo DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.todoRepository.deleteById(id);
  }
}
```
