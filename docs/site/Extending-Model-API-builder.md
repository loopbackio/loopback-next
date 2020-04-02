---
lang: en
title: 'Extending Model API builder'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Extending-Model-API-builder.html
---

The
[`@loopback/model-api-builder`](https://github.com/strongloop/loopback-next/tree/master/packages/model-api-builder)
package provides types and helpers for packages contributing Model API builders.
From a model class, this module can be used to define a contract to create a
corresponding repository and controller. An example Model API builder is the
[`CrudRestApiBuilder`](https://loopback.io/doc/en/lb4/apidocs.rest-crud.crudrestapibuilder.html)
which is used to create a CRUD REST repository and controller. You can see more
details in [Creating CRUD REST APIs](Creating-crud-rest-apis.md).

`@loopback/model-api-builder` helps create a configuration for the repository
and controllers and
[`@loopback/boot`](https://github.com/strongloop/loopback-next/tree/master/packages/boot)
processes this configuration and registers appropriate repositories and
controllers with the app.

To create your own API builder, you need to install the
`@loopback/model-api-builder` dependency:

```sh
npm install --save @loopback/model-api-builder
```

Then you can define class to define your builder. For example:

{% include code-caption.html content="sample.api-builder.ts" %}

```ts
import {ModelApiBuilder} from '@loopback/model-api-builder';

export class SampleApiBuilder implements ModelApiBuilder {}
```

Then bind the builder with
[`@asModelApiBuilder`](https://loopback.io/doc/en/lb4/apidocs.model-api-builder.asmodelapibuilder.html)
so it can be used as an API builder option.

```ts
import {bind} from '@loopback/core';
import {asModelApiBulder, ModelApiBuilder} from '@loopback/model-api-builder';

@bind(asModelApiBuilder)
export class SampleApiBuilder implements ModelApiBuilder {}
```

Since the builder implements `ModelApiBuilder`, the `build` function must be
defined:

```ts
import {bind} from '@loopback/core';
import {
  asModelApiBuilder,
  ModelApiBuilder,
  ModelApiConfig,
} from '@loopback/model-api-builder';
import {ApplicationWithRepositories} from '@loopback/repository';
import {Model} from '@loopback/rest';

@bind(asModelApiBuilder)
export class SampleApiBuilder implements ModelApiBuilder {
  readonly pattern: string = 'Sample'; // put the name of your builder here

  build(
    application: ApplicationWithRepositories,
    modelClass: typeof Model & {prototype: Model},
    cfg: ModelApiConfig,
  ): Promise<void> {
    // here you can define how the repository and controller classes are built
  }
}
```

Additionally, you can add configuration options to be used:

```ts
// imports

export interface SampleApiConfig extends ModelApiConfig {
  // add configuration options here
}

@bind(asModelApiBuilder)
export class SampleApiBuilder implements ModelApiBuilder {
  // other code here
}
```

After the builder is created, it must be exported as a component in order for it
to be selected by
[`ModelApiBooter`](https://loopback.io/doc/en/lb4/apidocs.boot.modelapibooter.html)
and to then be used in an application. Create a class for the component to
export the builder:

{% include code-caption.html content="sample.component.ts" %}

```ts
import {Component, createBindingFromClass} from '@loopback/core';
import {SampleApiBuilder} from './sample.api-builder';

export class SampleComponent implements Component {
  bindings = [createBindingFromClass(SampleApiBuilder)];
}
```

To use the component, add it to your application class:

{% include code-caption.html content="src/application.ts" %}

```ts
// other imports

// add an import for your component
import {SampleComponent} from '../sample.component';

export class ExampleApplication extends BootMixin(
  RepositoryMixin(RestApplication),
) {
  constructor(options: ApplicationConfig = {}) {
    // other code

    // add the following line
    this.component(SampleComponent);
  }
}
```
