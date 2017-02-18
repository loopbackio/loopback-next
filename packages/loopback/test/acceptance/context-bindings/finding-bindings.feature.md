# Feature: Context Binding - Finding bindings

## Scenario: Finding all bindings

- Given a context
- And a binding with key `foo` bound to the value `bar`
- And another binding with key `bat` bound to the value `baz`
- When I find all bindings
- Then I get a list of all bindings

```ts
// create a container for bindings
const ctx = new Context();

// creating two simple bindings
ctx.bind('foo').to('bar');
ctx.bind('baz').to('qux');

// find all bindings
const bindings = ctx.find();

const keys = bindings.map(binding => {
  return binding.key;
});
console.log(keys); // => ['foo', 'baz']
```

## Scenario: Finding bindings by pattern

- Given a context
- And a binding with key `my.foo` bound to the value `bar`
- And another binding with key `my.baz` bound to the value `qux`
- When I find all bindings using a pattern
- Then I get a list of all bindings matching the pattern

```ts
// create a container for bindings
const ctx = new Context({
  delimiter: '.' // default
});

// creating three simple bindings
ctx.bind('my.foo').to('bar');
ctx.bind('my.baz').to('qux');
ctx.bind('ur.quux').to('quuz');

// find all bindings
const bindings = ctx.find('my.*');

const keys = bindings.map(binding => binding.key)
console.log(keys); // => ['my.foo', 'my.baz']
```
