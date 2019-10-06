---
lang: en
title: 'Command-line interface'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Command-line-interface.html
---

LoopBack 4 provides command-line tools to help you get started quickly. The
command line tools generate application and extension projects and install their
dependencies for you. The CLI can also help you generate artifacts, such as
controllers, for your projects. Once generated, the scaffold can be expanded
with users' own code as needed.

To use LoopBack 4's CLI, run this command:

```sh
npm install -g @loopback/cli
```

## Generating LoopBack projects

{% include_relative tables/lb4-project-commands.html %}

## Generating LoopBack artifacts

{% include_relative tables/lb4-artifact-commands.html %}

## Upgrading LoopBack dependencies

When the application is initially scaffolded with `lb4` command, we add the cli
version to `.yo.rc.json`:

```json
{
  "@loopback/cli": {
    "version": "1.21.4"
  }
}
```

To find a compatible list of LoopBack modules for a given version of cli, run:

```sh
lb4 -v
```

It prints out compatible modules that are released with the current version of
cli.

```
@loopback/cli version: 1.23.1

@loopback/* dependencies:
  - @loopback/authentication: ^3.1.1
  - @loopback/boot: ^1.5.8
  - @loopback/build: ^2.0.13
  - @loopback/context: ^1.23.2
  - @loopback/core: ^1.10.4
  - @loopback/metadata: ^1.3.4
  - @loopback/openapi-spec-builder: ^1.2.15
  - @loopback/openapi-v3: ^1.9.9
  - @loopback/repository-json-schema: ^1.10.2
  - @loopback/repository: ^1.15.1
  - @loopback/rest: ^1.20.1
  - @loopback/testlab: ^1.9.1
  - @loopback/docs: ^2.2.1
  - @loopback/example-hello-world: ^1.2.16
  - @loopback/example-log-extension: ^1.2.16
  - @loopback/example-rpc-server: ^1.2.16
  - @loopback/example-todo: ^1.8.2
  - @loopback/example-soap-calculator: ^1.6.17
  - @loopback/service-proxy: ^1.3.8
  - @loopback/http-caching-proxy: ^1.1.15
  - @loopback/http-server: ^1.4.15
  - @loopback/example-todo-list: ^1.11.1
  - @loopback/dist-util: ^0.4.0
  - @loopback/rest-explorer: ^1.4.1
  - @loopback/eslint-config: ^4.1.1
  - @loopback/example-express-composition: ^1.7.1
  - @loopback/example-greeter-extension: ^1.3.16
  - @loopback/booter-lb3app: ^1.3.2
  - @loopback/example-lb3-application: ^1.1.16
  - @loopback/example-greeting-app: ^1.2.2
  - @loopback/example-context: ^1.2.16
  - @loopback/repository-tests: ^0.5.1
  - @loopback/extension-health: ^0.2.8
  - @loopback/authorization: ^0.4.1
  - @loopback/rest-crud: ^0.3.2
  - @loopback/security: ^0.1.4
  - @loopback/authentication-passport: ^1.0.1
```

Once a project is generated, running `lb4` commands on the project checks if the
project has incompatible versions with the current cli and prompts users to
proceed or exit.

To update dependencies in the `package.json`, you can use `npm update` or
[npm-check](https://www.npmjs.com/package/npm-check). The existing application
may be broken due to dependency changes. Please make sure build/test/run are
still passing after the upgrade.

## Naming Convention

LoopBack 4 uses different convention for naming classes, variables, and files.

- Class name: `PascalCase`.
- File name: `kebab-case`.
- Variable name: `camelCase`.

Here are some examples:

{% include_relative tables/lb4-class-file-naming-convention.html %}
