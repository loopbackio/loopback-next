# Feature: Context bindings - Creating and resolving bindings

- In order to manage my dependencies
- As a developer
- I want to create bindings
- So that dependencies can be retrieved via a known name

## Scenario: Simple bindings

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
const val = await ctx.get('foo'); // val => bar
```

## Scenario: Dynamic Bindings

- Given a context
- And a dynamic binding named `data` with values `a`, `b`, `c`
- When I resolve the binding for `data` three times
- Then I get the value `a`
- And then I get the value `b`
- And then I get the value `c`

```ts
// create a container for bindings
const ctx = new Context();
const data = ['a', 'b', 'c'];

// creating a dynamic binding
ctx.bind('data').toDynamicValue(() => {
  return data.shift();
});

await ctx.get('data'); // => a
await ctx.get('data'); // => b
await ctx.get('data'); // => c
```
