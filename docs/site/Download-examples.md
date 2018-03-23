---
lang: en
title: 'Download examples'
keywords: LoopBack 4.0, LoopBack 4
tags:
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Download-examples.html
summary:
---

### Synopsis

Downloads a LoopBack example project from our
[GitHub monorepo](https://github.com/strongloop/loopback-next).

```text
lb4 example [options] [<example-name>]
```

### Options

{% include_relative includes/CLI-std-options.md %}

### Arguments

`example-name` - Optional name of the example to clone. If provided, the tool
will skip the example-name prompt and run in a non-interactive mode.

See [Examples and tutorials](Examples-and-tutorials.md) for the list of
available examples.

### Interactive Prompts

The tool will prompt you for:

- Name of the example to download. If the name had been supplied from the
  command-line, the prompt is skipped.

### Output

The example project is downloaded to a new directory. For example, when
downloading `getting-started` example, the tool stores the files under the newly
created `loopback4-example-getting-started` directory.
