# Feature: Context Bindings

- In order to build stateless applications
- As a app developer
- I want the framework I am using to handle the lifecycle of dependencies
- So that I can focus on my application specific behavior

## Scenario: Basic Usage

- Given an empty `Context` (binding container)
- And a simple value, `bar` bound to the key `foo`
- When I resolve the binding for `foo`
- Then I get the bound value `bar`

```ts
// create a container for bindings
let ctx = new Context();

// creating a simple binding
ctx.bind('foo').to('bar');

// getting a value (resolving the binding)
let val = ctx.get('foo'); // val => bar
```
