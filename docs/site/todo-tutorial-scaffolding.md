---
lang: en
title: 'Create your app scaffolding'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/todo-tutorial-scaffolding.html
summary: LoopBack 4 Todo Application Tutorial - Create app scaffolding
---

### Create your app scaffolding

The LoopBack 4 CLI toolkit comes with templates that generate whole
applications, as well as artifacts (for example, controllers, models, and
repositories) for existing applications.

To generate your application using the toolkit, run the `lb4 app` command and
fill out the on-screen prompts:

```sh
$ lb4 app
? Project name: todo-list
? Project description: A todo list API made with LoopBack 4.
? Project root directory: (todo-list)
? Application class name: (TodoListApplication)
? Select features to enable in the project:
❯◉ Enable tslint: add a linter with pre-configured lint rules
 ◉ Enable prettier: add new npm scripts to facilitate consistent code formatting
 ◉ Enable mocha: install mocha to assist with running tests
 ◉ Enable loopbackBuild: use @loopback/build helpers (e.g. lb-tslint)
 ◉ Enable vscode: add VSCode config files
 ◉ Enable repositories: include repository imports and RepositoryMixin
 ◉ Enable services: include service-proxy imports and ServiceMixin
 # npm will install dependencies now
 Application todo-list was created in todo-list.
```

For this tutorial, when prompted with the options for enabling certain project
features (LoopBack's build, tslint, mocha, etc.), leave them all enabled.

### Structure

After your application is generated, you will have a folder structure similar to
the following:

```text
public/
  index.html
src/
  __tests__/
    README.md
    acceptance/
      home-page.acceptance.ts
      ping.controller.acceptance.ts
      test-helper.ts
  controllers/
    index.ts
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
  migrate.ts
  sequence.ts
test/
  mocha.opts
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
.mocharc.json
```

| File                                                                                                                                           | Purpose                                                                                                                                                                                                                                                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.ts`                                                                                                                                     | Allows importing contents of the `src` folder (for use elsewhere)                                                                                                                                                                                                                                                                                                                         |
| `index.js`                                                                                                                                     | Top-level file connecting components of the application.                                                                                                                                                                                                                                                                                                                                  |
| `package.json`                                                                                                                                 | Your application's package manifest. See [package.json](https://docs.npmjs.com/files/package.json) for details.                                                                                                                                                                                                                                                                           |
| `tsconfig.json`                                                                                                                                | The TypeScript project configuration. See [tsconfig.json](http://www.typescriptlang.org/docs/handbook/tsconfig-json.html) for details.                                                                                                                                                                                                                                                    |
| `tslint.json`                                                                                                                                  | [TSLint configuration](https://palantir.github.io/tslint/usage/tslint-json/)                                                                                                                                                                                                                                                                                                              |
| `tslint.build.json`                                                                                                                            | [TSLint configuration (build only)](https://palantir.github.io/tslint/usage/tslint-json/)                                                                                                                                                                                                                                                                                                 |
| `README.md`                                                                                                                                    | The Markdown-based README generated for your application.                                                                                                                                                                                                                                                                                                                                 |
| `LICENSE`                                                                                                                                      | A copy of the MIT license. If you do not wish to use this license, please delete this file.                                                                                                                                                                                                                                                                                               |
| `src/application.ts`                                                                                                                           | The application class, which extends [`RestApplication`](http://apidocs.strongloop.com/@loopback%2fdocs/rest.html#RestApplication) by default. This is the root of your application, and is where your application will be configured. It also extends [`RepositoryMixin`](https://apidocs.strongloop.com/@loopback%2fdocs/repository.html#RepositoryMixin) which defines the datasource. |
| `src/index.ts`                                                                                                                                 | The starting point of your microservice. This file creates an instance of your application, runs the booter, then attempts to start the [`RestServer`](http://apidocs.strongloop.com/@loopback%2fdocs/rest.html#RestServer) instance bound to the application.                                                                                                                            |
| `src/sequence.ts | An extension of the [Sequence](Sequence.md) class used to define the set of actions to take during a REST request/response. |
| `src/controllers/README.md`                                                                                                                    | Provides information about the controller directory, how to generate new controllers, and where to find more information.                                                                                                                                                                                                                                                                 |
| `src/controllers/ping.controller.ts`                                                                                                           | A basic controller that responds to GET requests at `/ping`.                                                                                                                                                                                                                                                                                                                              |
| `src/datasources/README.md`                                                                                                                    | Provides information about the datasources directory, how to generate new datasources, and where to find more information.                                                                                                                                                                                                                                                                |
| `src/models/README.md`                                                                                                                         | Provides information about the models directory, how to generate new models, and where to find more information.                                                                                                                                                                                                                                                                          |
| `src/repositories/README.md`                                                                                                                   | Provides information about the repositories directory, how to generate new repositories, and where to find more information.                                                                                                                                                                                                                                                              |
| `src/__tests__/README.md`                                                                                                                      | Please place your tests in this folder.                                                                                                                                                                                                                                                                                                                                                   |
| `src/__tests__/acceptance/ping.controller.acceptance.ts`                                                                                       | An example test to go with the ping controller in `src/controllers`.                                                                                                                                                                                                                                                                                                                      |
| `.mocharc.json`                                                                                                                                | [Mocha](https://mochajs.org/) configuration for running your application's tests.                                                                                                                                                                                                                                                                                                         |

### Navigation

Next step: [Add the Todo Model](todo-tutorial-model.md)
