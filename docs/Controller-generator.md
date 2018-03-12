---
lang: en
title: 'Controller generator'
keywords: LoopBack 4.0, LoopBack 4
tags:
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Controller-generator.html
summary:
---

{% include content/generator-create-app.html lang=page.lang %}

### Synopsis

Adds a new empty controller to a LoopBack application.

```
lb4 controller [options] [<name>]
```

### Options

`--controllerType`
: Type of the controller.

Valid types are `BASIC` and `REST`.  
`BASIC` corresponds to an empty controller, whereas `REST` corresponds to
REST controller with CRUD methods.

{% include_relative includes/CLI-std-options.md %}

### Arguments

`<name>` - Optional name of the controller to create as an argument to the command. 
If provided, the tool will use that as the default when it prompts for the name.

### Interactive Prompts

The tool will prompt you for:

- Name of the controller. If the name had been supplied from the command line,
the prompt is skipped and the controller is built with the name from the
command-line argument.
- Type of the controller. You can select from the following types:
  * **Empty Controller** - An empty controller definition
  * **REST Controller with CRUD Methods** - A controller wired up to a model 
  and repository definition, with pre-defined CRUD methods.

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

{% include warning.html content=
"
If you do not have a model and repository to select, then you will
receive an error!
" lang=page.lang %}

Here's an example of what the template will produce given a `Todo` model and
a `TodoRepository`:
```ts
import {Filter, Where} from '@loopback/repository';
import {post, param, get, put, patch, del} from '@loopback/openapi-v2';
import {inject} from '@loopback/context';
import {Todo} from '../models';
import {TodoRepository} from '../repositories';

export class TodoController {

  constructor(
    @inject('repositories.TodoRepository')
    public todoRepository : TodoRepository,
  ) {}

  @post('/todo')
  async create(@param.body('obj') obj: Todo)
    : Promise<Todo> {
    return await this.todoRepository.create(obj);
  }

  @get('/todo/count')
  async count(@param.query.string('where') where: Where) : Promise<number> {
    return await this.todoRepository.count(where);
  }

  @get('/todo')
  async find(@param.query.string('filter') filter: Filter)
    : Promise<Todo[]> {
      return await this.todoRepository.find(filter);
  }

  @patch('/todo')
  async updateAll(@param.query.string('where') where: Where,
    @param.body('obj') obj: Todo) : Promise<number> {
      return await this.todoRepository.updateAll(where, obj);
  }

  @del('/todo')
  async deleteAll(@param.query.string('where') where: Where) : Promise<number> {
    return await this.todoRepository.deleteAll(where);
  }

  @get('/todo/{id}')
  async findById(@param.path.number('id') id: number) : Promise<Todo> {
    return await this.todoRepository.findById(id);
  }

  @patch('/todo/{id}')
  async updateById(@param.path.number('id') id: number, @param.body('obj')
   obj: Todo) : Promise<boolean> {
    return await this.todoRepository.updateById(id, obj);
  }

  @del('/todo/{id}')
  async deleteById(@param.path.number('id') id: number) : Promise<boolean> {
    return await this.todoRepository.deleteById(id);
  }
}
```
