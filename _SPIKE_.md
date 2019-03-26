# Spike documentation

See the discussion in
[#2082](https://github.com/strongloop/loopback-next/issues/2082) and linked
issue for the discussions we already have had in the past.

The code in this spike is building on top of the spike for Inclusion of related
models ([PR#2592)(https://github.com/strongloop/loopback-next/pull/2592)),
please ignore the first commit.

## Overview

I am proposing to leverage the interface `JsonSchemaOptions` and
`getModelSchemaRef` helper to build schema with additional constraints. Later
on, we can explore different ways how to enable includeRelations flag via
OpenAPI spec extensions.

### Exclude properties from CREATE requests

An example showing a controller method excluding the property `id`:

```ts
class TodoListController {
  // ...

  @post('/todo-lists', {
    responses: {
      // left out for brevity
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TodoList, {exclude: ['id']}),
          /***** ^^^ THIS IS IMPORTANT - OPENAPI SCHEMA ^^^ ****/
        },
      },
    })
    obj: Pick<TodoList, Exclude<keyof TodoList, 'id'>>,
    /***** ^^^ THIS IS IMPORTANT - TYPESCRIPT TYPE ^^^ ****/
  ): Promise<TodoList> {
    return await this.todoListRepository.create(obj);
  }
}
```

An example schema produced by the helper in the request body spec:

```json
{
  "requestBody": {
    "content": {
      "application/json": {
        "schema": {
          "$ref": "#/components/schemas/TodoListWithout(id)"
        }
      }
    }
  }
}
```

The full schema in component schemas:

```json
{
  "TodoListWithout(id)": {
    "title": "TodoListWithout(id)",
    "properties": {
      "title": {
        "type": "string"
      },
      "color": {
        "type": "string"
      }
    },
    "required": ["title"]
  }
}
```

### Mark all properties as optional

An example showing a controller method accepting a partial model instance:

```ts
class TodoListController {
  // ...

  @patch('/todo-lists/{id}', {
    responses: {
      // left out for brevity
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TodoList, {partial: true}),
          /***** ^^^ THIS IS IMPORTANT - OPENAPI SCHEMA ^^^ ****/
        },
      },
    })
    obj: Partial<TodoList>,
    /***** ^^^ THIS IS IMPORTANT - TYPESCRIPT TYPE ^^^ ****/
  ): Promise<void> {
    await this.todoListRepository.updateById(id, obj);
  }
}
```

An example schema in components:

```json
{
  "TodoListPartial": {
    "title": "TodoListPartial",
    "properties": {
      "id": {
        "type": "number"
      },
      "title": {
        "type": "string"
      },
      "color": {
        "type": "string"
      }
    }
  }
}
```

### Using spec extension instead of a code-first helper

Later on, we can explore different ways how to enable `partial` and `exclude`
flags via OpenAPI spec extensions. For example:

```
schema: {'x-ts-type': Category, 'x-partial': true},
schema: {'x-ts-type': Category, 'x-exclude': ['id']},
```

In
https://github.com/strongloop/loopback-next/issues/1722#issuecomment-422439405,
a different format was proposed:

```
schema: {
  'x-ts-type': Order,
  'x-ts-type-options': {
    partial: true,
    exclude: []
  }
}
```

Either way, I am proposing to leave this part out of the initial implementation.

## Follow-up stories

1. Wait until the following stories from "Inclusion of related models" are
   implemented:

   1. Support `schema: {$ref, definitions}` in resolveControllerSpec
      [#2629](https://github.com/strongloop/loopback-next/issues/2629)

   2. Implement `getJsonSchemaRef` and `getModelSchemaRef` helpers
      [#2631](https://github.com/strongloop/loopback-next/issues/2631)

2. Enhance `getJsonSchema` with a new flag: `partial?: boolean`, also update CLI
   templates and example apps accordingly.

   --> https://github.com/strongloop/loopback-next/issues/2652

3. Enhance `getJsonSchema` with a new flag: `exclude?: string[]`, also update
   CLI templates and example apps accordingly.

   --> https://github.com/strongloop/loopback-next/issues/2653

4. Spike: configure `JsonSchemaOptions` via an OpenAPI spec extension

   --> https://github.com/strongloop/loopback-next/issues/2654
