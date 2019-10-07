---
lang: en
title: 'Creating an Express Application with LoopBack REST API'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/express-with-lb4-rest-tutorial.html
summary: A simple Express application with LoopBack 4 REST API
---

## Overview

[Express](https://expressjs.com) is an unopinionated Node.js framework. LoopBack
REST API can be mounted to an Express application and be used as middleware.
This way the user can mix and match features from both frameworks to suit their
needs.

{% include note.html content="
If you want to use LoopBack as the host instead and mount your Express
application on a LoopBack 4 application, see
[Mounting an Express Router](Routes.md#mounting-an-express-router).
" %}

This tutorial assumes familiarity with scaffolding a LoopBack 4 application,
[`Models`](Model.md), [`DataSources`](DataSources.md),
[`Repositories`](Repositories.md), and [`Controllers`](Controllers.md). To see
how they're used in a LoopBack application, please see the
[`Todo` tutorial](todo-tutorial.md).

## Try it out

If you'd like to see the final results of this tutorial as an example
application, follow these steps:

1.  Run the `lb4 example` command to select and clone the express-composition
    repository:

    ```sh
    lb4 example express-composition
    ```

2.  Switch to the directory.

    ```sh
    cd loopback4-example-express-composition
    ```

3.  Finally, start the application!

    ```sh
    $ npm start

    Server is running at http://127.0.0.1:3000
    ```

## Create your LoopBack Application

### Scaffold your Application

Run `lb4 app note` to scaffold your application and fill out the following
prompts as follows:

```sh
$ lb4 app note
? Project description: An application for recording notes.
? Project root directory: (note)
? Application class name: (NoteApplication)
 ◉ Enable eslint: add a linter with pre-configured lint rules
 ◉ Enable prettier: install prettier to format code conforming to rules
 ◉ Enable mocha: install mocha to run tests
 ◉ Enable loopbackBuild: use @loopback/build helpers (e.g. lb-eslint)
 ◉ Enable vscode: add VSCode config files
❯◯ Enable docker: include Dockerfile and .dockerignore
 ◉ Enable repositories: include repository imports and RepositoryMixin
 ◉ Enable services: include service-proxy imports and ServiceMixin
 # npm will install dependencies now
 Application note was created in note.
```

### Add Note Model

Inside the project folder, run `lb4 model` to create the `Note` model with
`Entity` model base class. Add an `id` property with type `number`, a required
`title` property with type `string`, and a `content` property of type `string`.

### Add a DataSource

Now, let's create a simple in-memory datasource by running the
`lb4 datasource ds` command and the following full path to file:
`./data/ds.json`.

Similar to the `Todo` example, let's create the `ds.json` by creating a data
folder at the application's root.

```sh
$ mkdir data
$ touch data/ds.json
```

Then copy and paste the following into the `ds.json` file:

```json
{
  "ids": {
    "Note": 3
  },
  "models": {
    "Note": {
      "1": "{\"title\":\"Things I need to buy\",\"content\":\"milk, cereal, and waffles\",\"id\":1}",
      "2": "{\"title\":\"Great frameworks\",\"content\":\"LoopBack is a great framework\",\"id\":2}"
    }
  }
}
```

### Add Note Repository

To create the repository, run the `lb4 repository` command and choose the
`DsDataSource`, as the datasource, `Note` model as the model, and
`DefaultCrudRepository` as the repository base class.

### Add Note Controller

To complete the `Note` application, create a controller using the
`lb4 controller note` command, with the `REST Controller with CRUD functions`
type, `Note` model, and `NoteRepository` repository. The `id`'s type will be
`number` and base HTTP path name is the default `/notes`.

## Create a Facade Express Application

Let's start by installing dependencies for the `express` module:

```sh
npm install --save express
npm install --save-dev @types/express
```

Create a new file **src/server.ts** to create your Express class:

{% include code-caption.html content="src/server.ts" %}

```ts
import * as express from 'express';

export class ExpressServer {
  constructor() {}
}
```

Create two properties, the Express application instance and LoopBack application
instance:

```ts
import {NoteApplication} from './application';
import {ApplicationConfig} from '@loopback/core';
import * as express from 'express';

export class ExpressServer {
  private app: express.Application;
  private lbApp: NoteApplication;

  constructor(options: ApplicationConfig = {}) {
    this.app = express();
    this.lbApp = new NoteApplication(options);
  }
}
```

Now, inside the constructor, we're going to add the basepath and expose the
front-end assets via Express:

```ts
this.app.use('/api', this.lbApp.requestHandler);
```

Let's also modify **public/index.html** to update the base path:

{% include code-caption.html content="public/index.html" %}

```html
<h3>OpenAPI spec: <a href="/api/openapi.json">/openapi.json</a></h3>
<h3>API Explorer: <a href="/api/explorer">/explorer</a></h3>
```

Then, we can add some custom Express routes, as follows:

```ts
import {Request, Response} from 'express';
import * as path from 'path';

export class ExpressServer {
  private app: express.Application;
  private lbApp: NoteApplication;

  constructor(options: ApplicationConfig = {}) {
    // earlier code

    // Custom Express routes
    this.app.get('/', function(_req: Request, res: Response) {
      res.sendFile(path.resolve('public/express.html'));
    });
    this.app.get('/hello', function(_req: Request, res: Response) {
      res.send('Hello world!');
    });
  }
}
```

And add the
[public/express.html](https://github.com/strongloop/loopback-next/blob/master/examples/express-composition/public/express.html)
file to your project.

Let's also install [`p-event`](https://www.npmjs.com/package/p-event) to make
sure the server is listening:

```sh
npm install --save p-event
```

Finally, we can add functions to boot the `Note` application and start the
Express application:

```ts
import pEvent from 'p-event';

export class ExpressServer {
  private app: express.Application;
  private lbApp: NoteApplication;

  constructor(options: ApplicationConfig = {}) {
    //...
  }

  async boot() {
    await this.lbApp.boot();
  }

  public async start() {
    await this.lbApp.start();
    const port = this.lbApp.restServer.config.port || 3000;
    const host = this.lbApp.restServer.config.host || '127.0.0.1';
    this.server = this.app.listen(port, host);
    await pEvent(this.server, 'listening');
  }

  // For testing purposes
  public async stop() {
    if (!this.server) return;
    await this.lbApp.stop();
    this.server.close();
    await pEvent(this.server, 'close');
    this.server = undefined;
  }
}
```

Now that our **src/server.ts** file is ready, then we can modify our
**src/index.ts** file to start the application:

{% include code-caption.html content="src/index.ts" %}

```ts
import {ExpressServer} from './server';
import {ApplicationConfig} from '@loopback/core';

export {ExpressServer, NoteApplication};

export async function main(options: ApplicationConfig = {}) {
  const server = new ExpressServer(options);
  await server.boot();
  await server.start();
  console.log('Server is running at http://127.0.0.1:3000');
}
```

{% include code-caption.html content="index.js" %}

```js
const application = require('./dist');

module.exports = application;

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      port: +process.env.PORT || 3000,
      host: process.env.HOST || 'localhost',
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
      // Use the LB4 application as a route. It should not be listening.
      listenOnStart: false,
    },
  };
  application.main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
```

Please note `listenOnStart` is set to `false` to instruct the LB4 application is
not listening on HTTP when it's started as the Express server will be listening.

Now let's start the application and visit <http://127.0.0.1:3000>:

```sh
npm start

Server is running at http://127.0.0.1:3000
```

If we go to the [Explorer](http://127.0.0.1:3000/api/explorer), we can make
requests for our LoopBack application. Notice how the server is
<http://127.0.0.1:3000/api>.

To view our custom `/hello` Express route, go to <http://127.0.0.1:3000/hello>
and you should see 'Hello world!'.

To serve static files in your application, add the following to the end of your
constructor:

{% include code-caption.html content="src/server.ts" %}

```ts
export class ExpressServer {
  private app: express.Application;
  private lbApp: NoteApplication;

  constructor(options: ApplicationConfig = {}) {
    // earlier code

    // Serve static files in the public folder
    this.app.use(express.static('public'));
  }

  // other functions
}
```

Now, you can load any static files in the **public/** folder. For example, add
the following
[public/notes.html](https://github.com/strongloop/loopback-next/blob/master/examples/express-composition/public/notes.html)
file to your project, run `npm start` again, and visit
<http://127.0.0.1:3000/notes.html>. You can now see a static file that will
display your Notes in a table format. For more information, please visit
[Serving static files in Express](https://expressjs.com/en/starter/static-files.html).

Congratulations, you just mounted LoopBack 4 REST API onto a simple Express
application.
