---
lang: en
title: 'Extension generator'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Extension-generator.html
---

### Synopsis

Creates a new LoopBack4 extension.

```sh
lb4 extension [options] [<name>]
```

### Options

`--description` : Description of the extension.

`--outDir` : Project root directory for the extension.

`--eslint` : Add ESLint to LoopBack4 extension project.

`--prettier` : Add Prettier to LoopBack4 extension project.

`--mocha` : Add Mocha to LoopBack4 extension project.

`--loopbackBuild` : Add @loopback/build module's script set to LoopBack4
extension project.

`--vscode`: Add VSCode config files to LoopBack4 application project

{% include_relative includes/CLI-std-options.md %}

### Arguments

`<name>` - Optional name of the extension given as an argument to the command.
If provided, the tool will use that as the default when prompting for the name.

### Interactive Prompts

The tool will prompt you for:

- Name of the extension as will be shown in `package.json`. If the name had been
  supplied from the command-line, the prompt is skipped and the extension is
  built with the name from the command-line argument. Must follow npm naming
  conventions.

- Description of the extension as will be shown in `package.json`.

- Name of the directory in which to create your extension. Defaults to the name
  of the extension previously entered.

- Optional modules to add to the extension. These modules are helpful tools to
  help format, test, and build a LoopBack4 extension. Defaults to `true` for all
  of the modules. The prompted modules are:

  - [`eslint`](https://www.npmjs.com/package/eslint)
  - [`prettier`](https://www.npmjs.com/package/prettier)
  - [`mocha`](https://www.npmjs.com/package/mocha)
  - [`@loopback/build`](https://www.npmjs.com/package/@loopback/build)
  - [`vscode`](https://code.visualstudio.com/)
