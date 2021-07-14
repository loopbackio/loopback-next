# Feature: Context bindings - Unlocking Bindings

- In order to reuse names for stale bindings
- As a developer
- I want to "unlock" bindings
- So that new values can be bound using the same names

## Scenario: Unlocking a locked binding

- Given an empty `Context` (binding container)
- And a binding that is `locked`
- When I unlock the binding
- And create another binding with the same name
- Then my new binding overwrites the old binding

```ts
// create a container for bindings
let ctx = new Context();

// creating a simple binding
let binding = ctx.bind('foo').to('bar');

// that is protected
binding.lock();

// unlock the binding
binding.unlock();

// rebind does not throw
ctx.bind('foo').to('baz');

// new value is baz
console.log(await ctx.get('foo')); // => baz
```
