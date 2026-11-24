---
lang: en
title: 'Create your first app'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Create-your-first-app.html
summary: Write and run a LoopBack 4 "Hello World" project in TypeScript.
---

## Create Your First App

### Create a new project

The LoopBack 4 CLI scaffolds a new project by setting up the project structure,
configuring the TypeScript, and installing required dependencies.

To create a new project, run the following command and follow the prompts:

```sh
lb4 app
```

Provide the following inputs when prompted:

```sh
? Project name: getting-started
? Project description: Getting started tutorial
? Project root directory: getting-started
? Application class name: StarterApplication
? Select features to enable in the project:
❯◉ Enable eslint: add a linter with pre-configured lint rules
 ◉ Enable prettier: install prettier to format code conforming to rules
 ◉ Enable mocha: install mocha to run tests
 ◉ Enable loopbackBuild: use @loopback/build helpers (e.g. lb-eslint)
 ◉ Enable editorconfig: add EditorConfig files
 ◉ Enable vscode: add VSCode config files
 ◉ Enable docker: include Dockerfile and .dockerignore
 ◉ Enable repositories: include repository imports and RepositoryMixin
 ◉ Enable services: include service-proxy imports and ServiceMixin
```

### Starting the project

The generated project includes a built-in `/ping` endpoint for testing.

Start the application:

```sh
cd getting-started
npm install
npm start
```

Open your brower and navigate to:
[http://127.0.0.1:3000/ping](http://127.0.0.1:3000/ping).

### Add a Controller

Next, add a custom [controller](Controller.md). In this example, you’ll create a
simple “Hello World” endpoint.

Run:

```sh
lb4 controller
```

- _Note: If your application is running, press **CTRL+C** to stop it before
  running the command._

Respond to the prompts:

```sh
? Controller class name: hello
? What kind of controller would you like to generate? Empty Controller
  create src/controllers/hello.controller.ts
  update src/controllers/index.ts

Controller hello was now created in src/controllers/
```

### Implement the Controller

Replace the contents of `src/controllers/hello.controller.ts` with the
following:

```ts
import {get} from '@loopback/rest';

export class HelloController {
  @get('/hello')
  hello(): string {
    return 'Hello world!';
  }
}
```

### Test the Endpoint

Restart the application:

```sh
npm start
```

Open your browser and navigate to:
[http://127.0.0.1:3000/hello](http://127.0.0.1:3000/hello)

You should see:

```
Hello world!
```

### Code sample

View the complete example project here:
[https://github.com/loopbackio/loopback-next/tree/master/examples/hello-world](https://github.com/loopbackio/loopback-next/tree/master/examples/hello-world)
