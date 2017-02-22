# Feature: Context bindings - Resolving bindings

- In order to use my bound dependencies
- As a developer
- I want to resolve bindings
- So that dependencies can be retrieved via a known name

## Scenario: Resolving a binding

- Given a context
- When I bind the value `bar` to the key `foo`
- Then I can resolve the value `bar` using the key `foo`

```ts
// create a container for bindings
const ctx = new Context();

// creating a simple binding
ctx.bind('foo').to('bar');

// getting a value (resolving the binding)
const val = ctx.get('foo'); // val => bar
```
