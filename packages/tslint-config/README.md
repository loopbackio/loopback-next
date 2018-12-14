# @loopback/tslint-config

Shared TSLint config to enforce a consistent code style for LoopBack development

## Installation

```shell
$ npm install --save @loopback/tslint-config
```

## Basic Use

An example `tslint.json` file:

```json5
{
  $schema: 'http://json.schemastore.org/tslint',
  extends: ['@loopback/tslint-config/tslint.common.json'],
}
```

An example `tslint.buid.json` file:

```json5
{
  $schema: 'http://json.schemastore.org/tslint',
  extends: ['@loopback/tslint-config/tslint.build.json'],
}
```

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
