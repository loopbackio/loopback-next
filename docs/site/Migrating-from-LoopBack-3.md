---
lang: en
title: 'Migrating from LoopBack 3'
keywords: LoopBack 4.0, LoopBack 4, LoopBack 3
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Migrating-from-LoopBack-3.html
---

For current LoopBack 3 users who want to migrate to LoopBack 4, LoopBack 4
offers a way to mount your LoopBack 3 application in a LoopBack 4 project. By
adding your application this way, the application's REST API is included in the
OpenAPI spec provided by the LoopBack 4 application. This also means that the
LoopBack 3 application's models can be used with the LoopBack 4 REST API
Explorer.

## Mounting the LoopBack 3 Application in a LoopBack 4 Project

{% include note.html content="
If you are not familiar with LoopBack 4, visit
[Getting started](Getting-started.md) for an introduction.
" %}

Follow
[this tutorial](https://github.com/strongloop/loopback-next/tree/master/examples/lb3-application#tutorial)
that goes through the full steps to mount your application.

To see an example of a mounted application, see
[lb3-application](https://github.com/strongloop/loopback-next/tree/master/examples/lb3-application)
which mounts the
[CoffeeShop example](https://github.com/strongloop/loopback-getting-started),
built from LoopBack 3, in a LoopBack 4 project.

{% include warning.html content="
An important thing to note is that LoopBack 3 applications produce Swagger
(OpenAPI version 2), whereas LoopBack 4 produces OpenAPI version 3.
`Lb3AppBooterComponent` converts the Swagger spec from the mounted LoopBack 3
application to OpenAPI v3 and adds it to the LoopBack 4 project's OpenAPI v3
spec.
" %}

### Options

[`Lb3AppBooterComponent`](https://loopback.io/doc/en/lb4/apidocs.booter-lb3app.lb3appbootercomponent.html)
comes with the option to either mount the full LoopBack 3 application or only
the rest routes. Default `mode` is the full application (`fullApp`).

{% include code-caption.html content="src/application.ts" %}

```ts
this.bootOptions = {
  lb3app: {
    mode: 'restRouter', // only REST routes are mounted
  },
};
```

To change the path where the main LoopBack 3 application server file is stored,
you can modify the `path`. Default `path` is `../lb3app/server/server`.

{% include code-caption.html content="src/application.ts" %}

```ts
this.bootOptions = {
  lb3app: {
    path: '../coffee-shop/server/server', // server file is found under this path
  },
};
```

Finally, you can modify the `restApiRoot` when only mounting the rest router of
your LoopBack 3 application. Default is `restApiRoot` is `/api`.

{% include code-caption.html content="src/application.ts" %}

```ts
this.bootOptions = {
  lb3app: {
    mode: 'restRouter',
    restApiRoot: '/coffees',
  },
};
```
