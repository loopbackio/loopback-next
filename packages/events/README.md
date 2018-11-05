# @loopback/events

This module contains utilities to help developers implement the observer
pattern.

## Basic Use

### Subscribe to an event source and type

```ts
const registry: ObservableRegistry = ...;
const source = ...;

const observer = ...;
registry.subscribe(source, 'start', observer);
```

## Installation

```sh
npm install --save @loopback/events
```

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
