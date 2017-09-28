## Scenario: Inherited Binding Resolution

- Given an empty `Context`
- And a child `Context`
- And a parent binding
- When I get the value for a binding of the child
- The binding resolves to the parent binding

```ts
let ctx = new Context();
let child = new Context();
ctx.addChild(child);

ctx.bind('foo').to('bar');

child.get('foo'); // => 'bar'
```

## Scenario: Simple Parameterized Binding

- Given a simple parameterized binding
- When I get the value with a specific key
- The binding is resolved

```ts
let ctx = new Context();
ctx.bind(':name').to('hello world')

await ctx.get('foo'); // => hello world
await ctx.get('bat'); // => hello world
```

## Scenario: Simple Dynamic Parameterized Binding

- Given a simple parameterized binding
- When I get the value with a specific key
- The binding is resolved with the corresponding value

```ts
let ctx = new Context();
let data = {
  foo: 'bar',
  bat: 'baz'
};

ctx.bind(':name').to((name) => {
  return data[name];
});

await ctx.get('foo'); // => bar
await ctx.get('bat'); // => baz
```

## Scenario: Namespaced Parameterized Binding

- Given a complex parameterized binding
- When I get the value with a specific key
- The binding is resolved

```ts
let ctx = new Context();
ctx.bind('foo.:name').to('hello world');

await ctx.get('foo.bar'); // => hello world
await ctx.get('foo.bat'); // => hello world
```
