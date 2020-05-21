---
lang: en
title: 'OpenAPI spec generator'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/OpenAPI-spec-generator.html
---

{% include content/generator-create-app.html lang=page.lang %}

### Synopsis

Saves OpenAPI spec to a json or yaml file.

```sh
lb4 openapi-spec [options]
```

### Options

`--out` or `-o` : File name for the OpenAPI spec

{% include_relative includes/CLI-std-options.md %}

### Interactive Prompts

The tool will prompt you for:

- **File name for the OpenAPI spec.** _(outFile)_ If the `--out` had been
  supplied from the command line, the prompt is skipped.

### Output

Once all the prompts have been answered, the CLI will do the following:

- Start the application without listening on an Http port.
- Load the OpenAPI spec
- Save the spec to the file in json or yaml format depending on the extension

```
lb4 openapi-spec

? File name for the OpenAPI spec: dist/openapi.json
Server is running at undefined
create dist/openapi.json
OpenAPI spec is written to dist/openapi.json.
```
