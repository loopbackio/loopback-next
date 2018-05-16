---
lang: en
title: 'Getting started'
keywords: LoopBack 4.0, LoopBack 4
tags:
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Getting-started.html
summary: Write and run a LoopBack 4 "Hello World" project in TypeScript.
---

## Prerequisites

Install [Node.js](https://nodejs.org/en/download/) (version 8.x.x or higher) if
not already installed on your machine.

## Install LoopBack 4 CLI

The LoopBack 4 CLI is a command-line interface that can scaffold a project or
extension with more features under development. CLI provides the fastest way to
get started with a LoopBack 4 project that adheres to best practices.

Install the CLI globally by running

```sh
npm i -g @loopback/cli
```

## Create a new project

The CLI tool will scaffold the project, configure TypeScript compiler and
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
? Select project build settings: Enable tslint, Enable prettier, Enable mocha, Enable loopbackBuild, Enable vscode
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

- Create a new file in `/src/controllers/` called `hello.controller.ts`.

- Paste the following contents into the file:

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

  - _Note: If your application is still running, press **CTRL+C** to stop it
    before restarting it_

- Visit <http://127.0.0.1:3000/hello> to see `Hello world!`
