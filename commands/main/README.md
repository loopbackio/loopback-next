@loopback/cli-core
==================

LoopBack 4 CLI built with oclif

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@loopback/cli-core.svg)](https://npmjs.org/package/@loopback/cli-core)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/strongloop/loopback-next?branch=master&svg=true)](https://ci.appveyor.com/project/strongloop/loopback-next/branch/master)
[![Downloads/week](https://img.shields.io/npm/dw/@loopback/cli-core.svg)](https://npmjs.org/package/@loopback/cli-core)
[![License](https://img.shields.io/npm/l/@loopback/cli-core.svg)](https://github.com/strongloop/loopback-next/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @loopback/cli-core
$ lb4 COMMAND
running command...
$ lb4 (-v|--version|version)
@loopback/cli-core/0.0.1 darwin-x64 node-v12.16.3
$ lb4 --help [COMMAND]
USAGE
  $ lb4 COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`lb4 hello [FILE]`](#lb4-hello-file)
* [`lb4 help [COMMAND]`](#lb4-help-command)

## `lb4 hello [FILE]`

describe the command here

```
USAGE
  $ lb4 hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ lb4 hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/strongloop/loopback-next/blob/v0.0.1/src/commands/hello.ts)_

## `lb4 help [COMMAND]`

display help for lb4

```
USAGE
  $ lb4 help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.0.1/src/commands/help.ts)_
<!-- commandsstop -->
