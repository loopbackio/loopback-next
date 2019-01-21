---
lang: en
title: 'Serving static files in LoopBack 4'
keywords: LoopBack
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Serving-static-files.html
---

One of the basic requirements of a web app is the ability to serve static files.
Serving static files from a LoopBack application is very simple - just call the
`app.static(urlPath, rootDir[, options])` method. The variables in the API are
explained below.

- `app`: An instance of a LoopBack application.
- `urlPath`: The path where the static assets are to be served from. Refer to
  [path examples](https://expressjs.com/en/4x/api.html#path-examples) in the
  Express docs for possible values.
- `rootDir`: The directory where the static assets are located on the file
  system.
- `options`: An optional object for configuring the underlying
  [express.static](https://expressjs.com/en/4x/api.html#express.static)
  middleware.

Here is an example of configuring an app to serve the static assets from a
directory named `public` at `/`.

{% include code-caption.html content="src/application.ts" %}

```ts
import * as path from 'path';

export class TodoListApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // ...

    this.static('/public', path.join(__dirname, '../../public'));
  }
}
```

If the path prefix overlaps with controller routes (e.g. `'/'`), then you should
only add the static route _after_ the controllers have been loaded.

```ts
  async boot() {
    await super.boot();

    // After all the controllers have loaded, add this fallback route
    this.static('/', path.join(__dirname, '../../public'));
  }
```

You can call `app.static()` multiple times to configure the app to serve static
assets from different drectories.

```ts
app.static('/files', path.join(__dirname, 'files'));
app.static('/downloads', path.join(__dirname, 'mp3s'));
```

You can also call `app.static()` multiple times on the same mounth path to merge
files from multiple filesystem directories and expose them on the same URL path.
When a file with the same name is present in multiple directories mounted at the
same URL path, then the precedence is given the file from the directory that was
registered earlier.

```ts
app.static('/files', path.join(__dirname, 'files'));
app.static('/files', path.join(__dirname, 'other-files'));
```

And `app.static()` can be called even after the app have started.

```ts
await app.boot();
await app.start();
app.static('/files', path.join(__dirname, 'files'));
```

### Authentication

The static router
[does not](https://github.com/strongloop/loopback-next/issues/1144#issuecomment-438359985)
work smoothly with authentication. If you are using authentication, then you
should change the way `authenticateRequest` is called in `sequence.ts` to
operate like this:

```ts
  async handle(context: RequestContext) {
    // ...

      // Only attempt authentication on non-static routes, because authenticateRequest fails on static routes
      if (!(route instanceof StaticAssetsRoute)) {
        await this.authenticateRequest(request);
      }

    // ...
  }
```
