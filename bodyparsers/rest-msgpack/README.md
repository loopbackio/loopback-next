# @loopback/rest-msgpack

This module extends LoopBack with the ability to receive
[MessagePack](https://msgpack.org/) requests and transparently convert it to a
regular JavaScript object. It provides a BodyParser implementation and a
component to register it.

## Stability: ⚠️Experimental⚠️

> Experimental packages provide early access to advanced or experimental
> functionality to get community feedback. Such modules are published to npm
> using `0.x.y` versions. Their APIs and functionality may be subject to
> breaking changes in future releases.

## Installation

```sh
npm i @loopback/rest-msgpack --save
```

## Usage

The component should be loaded in the constructor of your custom Application
class.

Start by importing the component class:

```ts
import {MsgPackBodyParserComponent} from '@loopback/rest-msgpack';
```

In the constructor, add the component to your application:

```ts
this.component(MsgPackBodyParserComponent);
```

The body parser will accept requests with the following MIME type
(`Content-Type`) blobs:

- `application/msgpack`
- `application/x-msgpack`
- `application/*+msgpack`

### Accepting MessagePack Requests

To accept MessagePack requests in a controller, amend the OpenAPI decorator to
include the MIME type as a possible request body.

For example, to update the Todo controller to accept MessagePack:

```typescript
import {post, getModelSchemaRef, requestBody} from '@loopback/rest';

class TodoController {
  // Omitted constructor for bevity

  @post('/todos')
  async create(
    @requestBody({
      content: {
        // Change existing or append a new request body accepted MIME type
        'application/msgpack': {
          schema: getModelSchemaRef(Todo, {
            title: 'NewTodo',
            exclude: ['id'],
          }),
        },
      },
    })
    todo: // Keep the request body object type, since the body parser transparently
    // converts it into a JavaScript object.
    Omit<Todo, 'id'>,

    // For bevity, the function does not return anything. See
    // 'Returning MessagePack Requests' below.
  ): void {
    this.todoRepository.create(todo);
  }
}
```

The MessagePack request payload will be transparently converted into a
JavaScript object and validated against the JSON Schema.

### Returning MessagePack Requests

{% include note.html content="The body parser will not convert responses into `application/msgpack` automatically. This feature is being tracked by [#6275](https://github.com/strongloop/loopback-next/issues/6275)" %}

To return MessagePack requests in a controller, amend the requestBody decorator
to include the MIME type as a possible response and use a parser library.

For example, to update the Todo controller to return in MessagePack:

```ts
// `msgpack5` is re-exported by `@loopback/rest-msgpack` for convenience.
// It is recommended to bind it to context the inject it to benefit from
// dependency injection.
import {MsgPackBodyParserBindings, msgpack} from '@loopback/rest-msgpack';
import {inject} from '@loopback/core';
import {getModelSchemaRef, post, Response, RestBindings} from '@loopback/rest';

class TodoController {
  private readonly _response: Response;

  constructor(
    // Omitted other dependency injections (e.g. repository) for bevity.

    // Inject the Response object to the controller
    @inject(RestBindings.Http.RESPONSE)
    private readonly _res: Response,
  ) {}

  @get('/todos', {
    responses: {
      '200': {
        description: 'Array of Todo model instances',
        content: {
          // Update existing or amend new possible response
          'application/msgpack': {
            schema: {type: 'array', items: getModelSchemaRef(Todo)},
          },
        },
      },
    },
  })
  async findTodos(
    @param.filter(Todo)
    filter?: Filter<Todo>,

    // Change function return type to Promise<void>.
  ): Promise<void> {
    // Internally, LoopBack 4 will try to guess and override the `Content-Type`
    // header, even after manually setting the headers.
    // Buffers are automatically detected as `application/octet-stream`.
    // We can use `Response.end()` to bypass that.
    //
    // See: https://github.com/strongloop/loopback-next/issues/5168
    //
    this._res
      .type('application/msgpack')
      .end(msgpack().encode(this.todoRepository.find(filter)));
  }
}
```

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
