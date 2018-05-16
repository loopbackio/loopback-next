---
lang: en
title: 'Create your app scaffolding'
keywords: LoopBack 4.0, LoopBack 4
tags:
sidebar: lb4_sidebar
permalink: /doc/en/lb4/todo-tutorial-scaffolding.html
summary: LoopBack 4 Todo Application Tutorial - Create app scaffolding
---

### Create your app scaffolding

The LoopBack 4 CLI toolkit comes with templates that allow you to generate whole
applications, as well as artifacts (ex. controllers, models, repositories) for
existing applications.

To generate your application using the toolkit, run the `lb4 app` command and
fill out the on-screen prompts:

```sh
$ lb4 app
? Project name: todo-list
? Project description: A todo list API made with LoopBack 4.
? Project root directory: (todo-list)
? Application class name: (TodoListApplication)
? Select project build settings:  (Press <space> to select, <a> to toggle all, <i> to inverse selection)
❯◉ Enable tslint
 ◉ Enable prettier
 ◉ Enable mocha
 ◉ Enable loopbackBuild
 ◉ Enable vscode
 # npm will install dependencies now
 Application todo-list is now created in todo-list.
```

For this tutorial, when prompted with the options for selecting things like
whether or not to enable certain project features (loopback's build, tslint,
mocha, etc.), leave them all enabled.

### Structure

After your application is generated, you will have a folder structure similar to
this:

```text
src/
  controllers/
    README.md
    ping.controller.ts
  datasources/
    README.md
  models/
    README.md
  repositories/
    README.md
  application.ts
  index.ts
  sequence.ts
test/
  README.md
  mocha.opts
  acceptance/
    ping.controller.acceptance.ts
node_modules/
  ***
LICENSE
README.md
index.js
index.ts
package.json
tsconfig.json
tslint.build.json
tslint.json
```

| File                                          | Purpose                                                                                                                                                                                                                                               |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| index.ts                                      | Allows importing contents of the `src` folder (for use elsewhere)                                                                                                                                                                                     |
| index.js                                      | Top-level wireup for execution of the application.                                                                                                                                                                                                    |
| package.json                                  | Your application's package manifest. See [package.json](https://docs.npmjs.com/files/package.json) for details.                                                                                                                                       |
| tsconfig.json                                 | The TypeScript project configuration. See [tsconfig.json](http://www.typescriptlang.org/docs/handbook/tsconfig-json.html) for details.                                                                                                                |
| tslint.json                                   | [TSLint configuration](https://palantir.github.io/tslint/usage/tslint-json/)                                                                                                                                                                          |
| tslint.build.json                             | [TSLint configuration (build only)](https://palantir.github.io/tslint/usage/tslint-json/)                                                                                                                                                             |
| README.md                                     | The Markdown-based README generated for your application.                                                                                                                                                                                             |
| LICENSE                                       | A copy of the MIT license. If you do not wish to use this license, please delete this file.                                                                                                                                                           |
| src/application.ts                            | The application class, which extends [`RestApplication`](http://apidocs.strongloop.com/@loopback%2frest/#RestApplication) by default. This is the root of your application, and is where your application will be configured.                         |
| src/index.ts                                  | The starting point of your microservice. This file creates an instance of your application, runs the booter, then attempts to start the [`RestServer`](http://apidocs.strongloop.com/@loopback%2frest/#RestServer) instance bound to the application. |
| src/sequence.ts                               | An extension of the [Sequence](Sequence.md) class used to define the set of actions to take during a REST request/response.                                                                                                                           |
| src/controllers/README.md                     | Provides information about the controller directory, how to generate new controllers, and where to find more information.                                                                                                                             |
| src/controllers/ping.controller.ts            | A basic controller that responds to GET requests at `/ping`.                                                                                                                                                                                          |
| src/datasources/README.md                     | Provides information about the datasources directory, how to generate new datasources, and where to find more information.                                                                                                                            |
| src/models/README.md                          | Provides information about the datasources directory, how to generate new datasources, and where to find more information.                                                                                                                            |
| src/repositories/README.md                    | Provides information about the repositories directory, how to generate new repositories, and where to find more information.                                                                                                                          |
| test/README.md                                | Please place your tests in this folder.                                                                                                                                                                                                               |
| test/mocha.opts                               | [Mocha](https://mochajs.org/) configuration for running your application's tests.                                                                                                                                                                     |
| test/acceptance/ping.controller.acceptance.ts | An example test to go with the ping controller in `src/controllers`.                                                                                                                                                                                  |

### Navigation

Next step: [Adding the legacy juggler](todo-tutorial-juggler.md)
