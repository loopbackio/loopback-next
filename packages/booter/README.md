# @loopback/booter

This module defines common types/interfaces for LoopBack booters that are
plugged into `@loopback/boot` as extensions.

A Booter is a Class that can be bound to an Application and is called to perform
a task before the Application is started. A Booter may have multiple phases to
complete its task. The task for a convention based Booter is to discover and
bind Artifacts (Controllers, Repositories, Models, etc.).

An example task of a Booter may be to discover and bind all artifacts of a given
type.

## Installation

```sh
$ npm install @loopback/booter
```

## Basic Use

### Implement a Booter

```ts
@booter('my-artifacts')
class MyBooter implements Booter {}
```

### ArtifactOptions

| Options      | Type                 | Description                                                                                                  |
| ------------ | -------------------- | ------------------------------------------------------------------------------------------------------------ |
| `dirs`       | `string \| string[]` | Paths relative to projectRoot to look in for Artifact                                                        |
| `extensions` | `string \| string[]` | File extensions to match for Artifact                                                                        |
| `nested`     | `boolean`            | Look in nested directories in `dirs` for Artifact                                                            |
| `glob`       | `string`             | A `glob` pattern string. This takes precedence over above 3 options (which are used to make a glob pattern). |

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
