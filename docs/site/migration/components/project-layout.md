---
lang: en
title: 'Migrating component project layout'
keywords:
  LoopBack 4, LoopBack 3, Node.js, TypeScript, OpenAPI, Migration, Extensions,
  Components
sidebar: lb4_sidebar
permalink: /doc/en/lb4/migration-extensions-project-layout.html
---

{% include tip.html content="
Missing instructions for your LoopBack 3 use case? Please report a [Migration docs issue](https://github.com/strongloop/loopback-next/issues/new?labels=question,Migration,Docs&template=Migration_docs.md) on GitHub to let us know.
" %}

The first step on the component migration journey is to reorganize the project
files, change component's entry point and documentation for adding the component
to the target application.

## LoopBack 3 component layout & mounting

A LB3 component is implemented as a function accepting the target app object and
the configuration options.

A minimal component consists of a single `index.js` file with the following
content:

```ts
module.exports = function initializeComponent(loopbackApplication, options) {
  // implementation
};
```

A component is typically added to a LB3 application by creating a new entry in
`server/component-config.json`, see
[LoopBack components](https://loopback.io/doc/en/lb3/LoopBack-components.html).

For example:

```json
{
  "loopback-explorer": {
    "mountPath": "/explorer"
  }
}
```

This allows the component to receive configuration. App developers can provide
environment-specific configuration by using `component-config.{env}.json` files.

## LoopBack 4 layout

As explained in [Creating components](../../Creating-components.md) and
[Using components](../../Component.md#using-components), a typical LoopBack 4
component is an npm package exporting a Component class.

The component class is usually implemented inside
`src/{component-name}.component.ts` file, for example
[src/metrics.component.ts](https://github.com/strongloop/loopback-next/blob/38f10b240551227d2d030c2fe8ee206880c9e029/extensions/metrics/src/metrics.component.ts):

```ts
import {Application, Component, CoreBindings} from '@loopback/core';
import {bind, config, ContextTags, inject} from '@loopback/core';
import {MetricsBindings} from './keys';
import {DEFAULT_METRICS_OPTIONS, MetricsOptions} from './types';

@bind({tags: {[ContextTags.KEY]: MetricsBindings.COMPONENT}})
export class MetricsComponent implements Component {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private application: Application,
    @config()
    options: MetricsOptions = DEFAULT_METRICS_OPTIONS,
  ) {
    // ...
  }
  // ...
}
```

The code snippet above also shows how a LoopBack 4 component can receive
configuration and the target application object.

## Usage instructions

LoopBack 4 components are added to applications inside application constructor.

First, the application file needs to import the component class:

```ts
import {MetricsComponent} from '@loopback/extension-metrics';
```

Then in the constructor, add the component to your application:

```ts
this.component(MetricsComponent);
```

Finally, the application can configure the component by adding the following
code to its constructor:

```ts
this.configure(MetricsBindings.COMPONENT).to({
  // the configuration
});
```

## Migration steps

It is not feasible to migrate a LoopBack 3 component project to a LoopBack 4
component project in a series of incremental changes done within the same
repository. We recommend to create a new project using
[`lb4 extension`](../../Extension-generator.md) CLI command and then
incrementally migrate artifacts from the original LoopBack 3 component to the
new project.

{% include note.html content="The extension project template used by `lb4 extension` is a bit outdated now, please refer to [loopback-next#5336](https://github.com/strongloop/loopback-next/issues/5336) for more details.
" %}
