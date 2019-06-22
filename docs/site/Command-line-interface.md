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

## Naming Convention

LoopBack 4 uses different convention for naming classes, variables, and files.

- Class name: `PascalCase`.
- File name: `kebab-case`.
- Variable name: `camelCase`.

Here are some examples:

{% include_relative tables/lb4-class-file-naming-convention.html %}
