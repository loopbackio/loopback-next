# Feature: Context bindings - Tagged Bindings

- In order to manage my dependencies
- As a developer
- I want to tag bindings
- So I can group dependencies together via a known name

## Scenario: Single tag

- Given a context
- And a binding named `foo` with value `bar`
- When I tag it `qux`
- Then it should be tagged with `qux`

```ts
// create a container for bindings
let ctx = new Context();

// create a tagged binding
let binding = ctx
  .bind('foo')
  .to('bar')
  .tag('qux');

console.log(binding.tags); // => Set { 'qux' }
```
