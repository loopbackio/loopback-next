# Feature: Context Bindings - Locking bindings

- In order to prevent rebinding errors
- As a developer
- I want to "lock" bindings
- So that new values cannot be bound using a duplicate key

## Scenario: Binding with a duplicate key

- Given an empty `Context` (binding container)
- And a binding that is `locked`
- When I create another binding with the same name
- Then an error is thrown

```ts
// create a container for bindings
let ctx = new Context();

// creating a simple binding
let binding = ctx.bind('foo');

// that is protected
binding.lock();

// and binding another value with the same key
try {
  ctx.bind('foo');
} catch (e) {
  // e => Rebind error
}
```
