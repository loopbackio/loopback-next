---
lang: en
title: 'App scaffolding'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/soap-calculator-tutorial-scaffolding.html
---

### Create your app scaffolding

Let's start by creating the initial application by running the following
command:

```sh
lb4 app soap-calculator --repositories --services
```

**Note:** The option **--repositories** instructs the **CLI** to include a
`RepositoryMixin` class in the application constructor which will be needed when
we create the datasource. The option **--services** instructs the **CLI** to
include a `ServiceMixin` class in the application constructor which will be
needed to register our SOAP service client.

**LB4** will ask you a few questions _(you can leave the default options)_. The
description and the root directory are obvious. The class name referes to the
main application class name for your project that will be located in the
application.ts file.

```sh
? Project description: soap-calculator
? Project root directory: soap-calculator
? Application class name: (SoapCalculatorApplication)
```

Next you will see a list of options for the build settings, if you did not
specify `--repositories` and `--services` in the last command, then you will see
them in this list, make sure you enable both the repository and the services for
the application.

{% include note.html content="
Enable all options besides `docker`, unless you know what you are doing, see
[The Getting Started guide](Getting-started.md) for more information.
" %}

```sh
? Select features to enable in the project:
 ◉ Enable eslint: add a linter with pre-configured lint rules
 ◉ Enable prettier: install prettier to format code conforming to rules
 ◉ Enable mocha: install mocha to run tests
 ◉ Enable loopbackBuild: use @loopback/build helpers (e.g. lb-eslint)
 ◉ Enable vscode: add VSCode config files
❯◯ Enable docker: include Dockerfile and .dockerignore
 ◉ Enable repositories: include repository imports and RepositoryMixin
 ◉ Enable services: include service-proxy imports and ServiceMixin
```

#### Run the Application

The next step is to change to the soap-calculator directory and run it, note
that **LB4** automatically installed the dependency packages for you, so no need
to run `npm install` before running it.

```sh
cd soap-calculator
npm start
```

You will see the app running on port 3000 by default, you can point your browser
to <http://localhost:3000/ping> and see a greeting message from **LB4**.

{% include note.html content="
Press Ctrl-C to stop running the application and continue to the next
step.
" %}

### Navigation

Previous step:
[Soap Web Service Overview](soap-calculator-tutorial-web-service-overview.md)

Next step: [Add a Datasoure](soap-calculator-tutorial-add-datasource.md)
