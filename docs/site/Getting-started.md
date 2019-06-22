---
lang: en
title: 'Getting started'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Getting-started.html
summary: Write and run a LoopBack 4 "Hello World" project in TypeScript.
---

## Prerequisites

Install [Node.js](https://nodejs.org/en/download/) (version 8.9 or higher) if it
is not already installed on your machine.

## Install LoopBack 4 CLI

The LoopBack 4 CLI is a command-line interface that scaffolds a project or an
extension by generating the basic code. The CLI provides the fastest way to get
started with a LoopBack 4 project that adheres to best practices.

Install the CLI globally by running

```sh
npm i -g @loopback/cli
```

## Create a new project

The CLI tool will scaffold the project, configure the TypeScript compiler, and
install all the required dependencies. To create a new project, run the CLI as
follows and answer the prompts.

```sh
lb4 app
```

Answer the prompts as follows:

```sh
? Project name: getting-started
? Project description: Getting started tutorial
? Project root directory: (getting-started)
? Application class name: StarterApplication
? Select features to enable in the project:
❯◉ Enable eslint: add a linter with pre-configured lint rules
 ◉ Enable prettier: install prettier to format code conforming to rules
 ◉ Enable mocha: install mocha to run tests
 ◉ Enable loopbackBuild: use @loopback/build helpers (e.g. lb-eslint)
 ◉ Enable vscode: add VSCode config files
 ◉ Enable docker: include Dockerfile and .dockerignore
 ◉ Enable repositories: include repository imports and RepositoryMixin
 ◉ Enable services: include service-proxy imports and ServiceMixin
```

### Starting the project

The project comes with a "ping" route to test the project. Let's try it out by
running the project.

```sh
cd getting-started
npm start
```

In a browser, visit <http://127.0.0.1:3000/ping>.

## Adding your own controller

Now that we have a basic project created, it's time to add our own
[controller](Controllers.md). Let's add a simple "Hello World" controller as
follows:

```sh
lb4 controller
```

- _Note: If your application is still running, press **CTRL+C** to stop it
  before calling the command_

- Answer the prompts as follows:

  ```sh
  ? Controller class name: hello
  ? What kind of controller would you like to generate? Empty Controller
    create src/controllers/hello.controller.ts
    update src/controllers/index.ts

  Controller hello was now created in src/controllers/
  ```

- Paste the following contents into the file
  `/src/controllers/hello.controller.ts`:

  ```ts
  import {get} from '@loopback/rest';

  export class HelloController {
    @get('/hello')
    hello(): string {
      return 'Hello world!';
    }
  }
  ```

- Start the application using `npm start`.

- Visit <http://127.0.0.1:3000/hello> to see `Hello world!`

## Code sample

You can view the generated code for this example at:
[hello-world](https://github.com/strongloop/loopback-next/tree/master/examples/hello-world)
