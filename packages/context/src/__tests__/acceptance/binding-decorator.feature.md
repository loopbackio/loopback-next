# Feature: @bind for classes representing various artifacts

- In order to automatically bind classes for various artifacts to a context
- As a developer
- I want to decorate my classes to provide more metadata
- So that the bootstrapper can bind them to a context according to the metadata

## Scenario: Add metadata to a class to facilitate automatic binding

When the bootstrapper discovers a file under `controllers` folder, it tries to
bind the exported constructs to the context automatically.

For example:

controllers/log-controller.ts

```ts
export class LogController {}

export const LOG_LEVEL = 'info';
export class LogProvider implements Provider<Logger> {
  value() {
    return msg => console.log(msg);
  }
}
```

There are three exported entries from `log-controller.ts` and the bootstrapper
does not have enough information to bind them to the context correctly. For
example, it's impossible for the bootstrapper to infer that `LogProvider` is a
provider so that the class can be bound using
`ctx.bind('providers.LogProvider').toProvider(LogProvider)`.

Developers can help the bootstrapper by decorating these classes with `@bind`.

```ts
@bind({tags: ['log']})
export class LogController {}

export const LOG_LEVEL = 'info';

@bind.provider(tags: ['log']})
export class LogProvider implements Provider<Logger> {
  value() {
    return msg => console.log(msg);
  }
}
```

Please note that we don't intend to use `@bind` to help the bootstrapper
discover such artifacts. The purpose of `@bind` is to allow developers to
provide more metadata on how the class should be bound.
