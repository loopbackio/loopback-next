# @loopback/example-todo

In this feature branch, I am modifying the Todo application to show design-first
approach.

The first step is to run the original Todo app to obtain the OpenAPI spec
document, so that I don't have to write it myself.

```sh
$  curl http://127.0.0.1:3000/openapi.json > api.json
```

The next step is to configure the application to use the OpenAPI document.
(Note that at this point, the app won't start because of duplicate operations.)

Now we can remove OpenAPI decorators from controller code.

Please note that the OpenAPI spec document already contains extension fields
mapping operations to controller methods implementing them, because the spec
was produced by the LoopBack app. In a real world, the person creating the spec
and/or the application developer will have to set extension fields
`x-controller-name` and `x-operation-name`.

Idea: maybe we should have a decorator to map controller methods to operations,
so that we don't need to touch the spec. For example:

```ts
class TodoController {
  // ...

  @implements('TodoController.replaceTodo')
  async replaceTodo(id: number, todo: Todo): Promise<void> {
    await this.todoRepository.replaceById(id, todo);
  }
}
```
