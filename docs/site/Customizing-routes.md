---
lang: en
title: 'Customizing Routes'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Express
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Customizing-routes.html
---

In addition to defining routes at the Controller and operation level, you can
also customize them at the application level.

## Implementing HTTP redirects

Both `RestServer` and `RestApplication` classes provide API for registering
routes that will redirect clients to a given URL.

Example use:

{% include code-caption.html content="src/application.ts" %}

```ts
import {RestApplication} from '@loopback/rest';

export class MyApplication extends RestApplication {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Use the default status code 303 See Other
    this.redirect('/', '/home');

    // Specify a custom status code 301 Moved Permanently
    this.redirect('/stats', '/status', 301);
  }
}
```

## Mounting an Express Router

If you have an existing [Express](https://expressjs.com/) application that you
want to use with LoopBack 4, you can mount the Express application on top of a
LoopBack 4 application. This way you can mix and match both frameworks, while
using LoopBack as the host. You can also do the opposite and use Express as the
host by mounting LoopBack 4 REST API on an Express application. See
[Creating an Express Application with LoopBack REST API](express-with-lb4-rest-tutorial.md)
for the tutorial.

Mounting an Express router on a LoopBack 4 application can be done using the
`mountExpressRouter` function provided by both
[`RestApplication`](https://loopback.io/doc/en/lb4/apidocs.rest.restapplication.html)
and [`RestServer`](https://loopback.io/doc/en/lb4/apidocs.rest.restserver.html).

Example use:

{% include note.html content="
Make sure [express](https://www.npmjs.com/package/express) is installed.
" %}

{% include code-caption.html content="src/express-app.ts" %}

```ts
import {Request, Response} from 'express';
import express from 'express';

const legacyApp = express();

// your existing Express routes
legacyApp.get('/pug', function (_req: Request, res: Response) {
  res.send('Pug!');
});

export {legacyApp};
```

{% include code-caption.html content="src/application.ts" %}

```ts
import {RestApplication} from '@loopback/rest';

const {legacyApp} = require('./express-app');

const openApiSpecForLegacyApp: RouterSpec = {
  // insert your spec here, your 'paths', 'components', and 'tags' will be used
};

class MyApplication extends RestApplication {
  constructor(/* ... */) {
    // ...

    this.mountExpressRouter('/dogs', legacyApp, openApiSpecForLegacyApp);
  }
}
```

Any routes you define in your `legacyApp` will be mounted on top of the `/dogs`
base path, e.g. if you visit the `/dogs/pug` endpoint, you'll see `Pug!`.
