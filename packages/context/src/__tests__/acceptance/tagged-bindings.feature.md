# Feature: Context bindings - Tagged Bindings

- In order to manage my dependencies
- As a developer
- I want to tag bindings
- So I can group dependencies together via a known name

## Scenario: Single named tag

- Given a context
- And a binding named `foo` with value `bar`
- When I tag it `controller`
- Then it should be tagged with `controller`

```ts
// create a container for bindings
let ctx = new Context();

// create a tagged binding
let binding = ctx
  .bind('foo')
  .to('bar')
  .tag('controller');

console.log(binding.tagNames); // =>  ['controller']
```

## Scenario: Multiple named tags

- Given a context
- And a binding named `foo` with value `bar`
- When I tag it `controller` and `rest`
- Then it should be tagged with `controller` and `rest`

```ts
// create a container for bindings
let ctx = new Context();

// create a tagged binding
let binding = ctx
  .bind('foo')
  .to('bar')
  .tag('controller', 'rest');

console.log(binding.tagNames); // =>  ['controller', 'rest']
```

## Scenario: Tags with both name and value

- Given a context
- And a binding named `foo` with value `bar`
- When I tag it `{name: 'my-controller'}` and `controller`
- Then it should be tagged with
  `{name: 'my-controller', controller: 'controller'}`

```ts
// create a container for bindings
let ctx = new Context();

// create a tagged binding
let binding = ctx
  .bind('foo')
  .to('bar')
  .tag({name: 'my-controller'}, 'controller');

console.log(binding.tagNames); // => ['name', 'controller']
console.log(binding.tagMap); // => {name: 'my-controller', controller: 'controller'}
```
