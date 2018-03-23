# Feature: Context Binding - Finding bindings

- In order to retrieve my dependencies
- As a developer
- I want to find bindings
- So that I can use them in my application's business logic

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
  delimiter: '.', // default
});

// creating three simple bindings
ctx.bind('my.foo').to('bar');
ctx.bind('my.baz').to('qux');
ctx.bind('ur.quux').to('quuz');

// find all bindings
const bindings = ctx.find('my.*');

const keys = bindings.map(binding => binding.key);
console.log(keys); // => ['my.foo', 'my.baz']
```

## Scenario: Finding bindings by tag

- Given a context
- And a binding with key `spot` bound to a `Dog` instance tagged as `dog`
- And a binding with key `fido` bound to a `Dog` instance tagged as `dog`
- When I find bindings by tag
- Then I get a list of all bindings matching the pattern

```ts
// create a container for bindings
const ctx = new Context();

// bind some animals and tag them as dogs
ctx
  .bind('spot')
  .to(new Dog())
  .tag('dog');
ctx
  .bind('fido')
  .to(new Dog())
  .tag('dog');
ctx
  .bind('mew')
  .to(new Dog())
  .tag('cat');

// find by dog tag
const bindings = ctx.findByTag('dog');

const dogs = bindings.map(binding => binding.key);
console.log(dogs); // => ['spot', 'fido']
```
