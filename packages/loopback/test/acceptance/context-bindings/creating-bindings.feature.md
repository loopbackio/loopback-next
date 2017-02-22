# Feature: Context bindings - Creating bindings

- In order to manage my dependencies
- As a developer
- I want to create bindings
- So that dependencies can be retrieved via a known name

## Scenario: Creating a binding

- Given a context
- When I bind the value `bar` to the key `foo`
- Then the key `foo` is associated to the value `bar`

```ts
// create a container for bindings
let ctx = new Context();

// creating a simple binding
ctx.bind('foo').to('bar');

// ensure associated to key `foo` is registered
ctx.contains('foo'); // true

// ensure bound to value `bar` is returned
const val = ctx.get('foo'); // val => bar
```
