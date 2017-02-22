# Feature: Context Binding
# Subfeature: Finding bindings

## Scenario: Basic usage

- Given an empty `Context` (binding container)
- And a simple value, `bar` bound to the key `foo`
- And a simple value, `baz` bound to the key `bat`
- When I find all bindings
- Then I get the `foo` binding
- And I get the `bar` binding

```ts
// create a container for bindings
let ctx = new Context();

// creating two simple bindings
ctx.bind('foo').to('bar');
ctx.bind('bat').to('baz');

// find all bindings
let bindings = ctx.find();

let keys = bindings.map((binding) => {
  return binding.key;
});
console.log(keys); // => ['bar', 'baz']
```

## Scenario: Finding Bindings By Pattern

- Given an empty `Context` (binding container)
- And a simple value, `bar` bound to the key `my.foo`
- And a simple value, `baz` bound to the key `my.bat`
- When I find all bindings
- Then I get the `foo` binding
- And I get the `bar` binding

```ts
// create a container for bindings
let ctx = new Context({
  delimiter: '.' // default
});

// creating two simple bindings
ctx.bind('my.foo').to('bar');
ctx.bind('my.bat').to('baz');

// find all bindings
let bindings = ctx.find('my.*');
let keys = bindings.map((binding) => {
  return binding.key;
});

console.log(keys); // => ['bar', 'baz']
```
