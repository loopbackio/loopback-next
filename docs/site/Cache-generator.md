---
lang: en
title: 'Cache generator'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, CLI
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Cache-generator.html
---

{% include content/generator-create-app.html lang=page.lang %}

### Synopsis

Add cache to LoopBack4 application using Redis datasource.

```sh
lb4 [cache] [options]
```

### Options

`--datasource` : Valid Redis datasource name.

{% include_relative includes/CLI-std-options.md %}

### Interactive Prompts

The tool will prompt you for:

- **Name of the datasource.** If the datasource had been supplied from the
  command line, the prompt is skipped and the datasource from command-line
  argument is used.

### Output

Following files are generated as result of this command:

```text
.
├── src/
|   ├── models/
|   |   └── cache.model.ts
|   ├── providers/
|   |   └── cache-strategy.provider.ts
|   ├── repositories/
|   |   └── cache.repository.ts
```

`cache.model.ts` is a model that cache repository uses to read and write data
into datasource.

`cache-strategy.provider.ts` provides the implementation of caching logic. You
can modify this file to extend caching capabilities.

`cache.repository.ts` is a repository that connects to Redis datasource and
reads and writes values from datasource.

The command also modifies `applications.ts` to include `CacheComponent`.

```
this.component(CacheComponent);
this.bind(CacheBindings.CACHE_STRATEGY).toProvider(CacheStrategyProvider);
```
