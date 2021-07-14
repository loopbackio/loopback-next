# @loopback/cli

This module contains the official CLI for LoopBack 4.

## Installation

Run the following command to install the CLI.

```
$ npm install -g @loopback/cli
```

## Basic Use

Run `lb4 --commands` or `lb4 -l` to list all available commands:

```
$ lb4 -l
```

Use the option `--help` to learn more about any specific command:

```
$ lb4 model --help
```

Run `lb4` or `lb4 app` to scaffold a new LoopBack 4 project.

```
$ lb4 app
? Project name: my-awesome-app
(etc.)
```

Use `lb4 --version` (or `lb4 -v`) to print out version information to include in
bug reports, for example:

```
$ lb4 -v
@loopback/cli version: 1.8.1

@loopback/* dependencies:
  - @loopback/authentication: ^1.0.14
  - @loopback/boot: ^1.0.14
  - @loopback/build: ^1.3.1
  - @loopback/context: ^1.6.0
  - @loopback/core: ^1.1.7
  - (etc.)
```

See [CLI reference](https://loopback.io/doc/en/lb4/Command-line-interface.html)
for a detailed documentation.

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
