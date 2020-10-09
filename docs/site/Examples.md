---
lang: en
title: Example Projects
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Examples
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Examples.html
---

LoopBack 4 comes with the following example projects.

### Shopping example application showcasing LoopBack features

- **[loopback4-example-shopping](https://github.com/strongloop/loopback4-example-shopping)**:
  An online e-commerce demo to validate/test the LoopBack 4 framework readiness.

### Examples for beginners

- **[hello-world](https://github.com/strongloop/loopback-next/tree/master/examples/hello-world)**:
  An example showing how to set up a simple application using LoopBack 4.

- **[todo](https://github.com/strongloop/loopback-next/tree/master/examples/todo)**:
  Tutorial example on how to build an application with LoopBack 4. See
  [tutorial instructions](https://loopback.io/doc/en/lb4/todo-tutorial.html).

- **[todo-list](https://github.com/strongloop/loopback-next/tree/master/examples/todo-list)**:
  Continuation of the todo example using relations in LoopBack 4. See
  [tutorial instructions](https://loopback.io/doc/en/lb4/todo-list-tutorial.html).

- **[soap-calculator](https://github.com/strongloop/loopback-next/tree/master/examples/soap-calculator)**:
  An example on how to integrate SOAP web services. See
  [tutorial instructions](https://loopback.io/doc/en/lb4/soap-calculator-tutorial.html).

### Examples implementing/using extensions

- **[greeter-extension](https://github.com/strongloop/loopback-next/tree/master/examples/greeter-extension)**:
  An example showing how to implement the extension point/extension pattern.

- **[log-extension](https://github.com/strongloop/loopback-next/tree/master/examples/log-extension)**:
  An example showing how to write a complex log extension for LoopBack 4.

- **[metrics-prometheus](https://github.com/strongloop/loopback-next/tree/master/examples/metrics-prometheus)**:
  illustrate metrics provided by
  [@loopback/metrics extension](https://github.com/strongloop/loopback-next/blob/master/extensions/metrics)
  and [Prometheus](https://prometheus.io/).

### Examples with migration

- **[lb3-application](https://github.com/strongloop/loopback-next/tree/master/examples/lb3-application)**:
  An example demonstrating how to mount your existing LoopBack 3 application on
  a new LoopBack 4 project.

- **[access-control-migration](https://github.com/strongloop/loopback-next/blob/master/examples/access-control-migration)**:
  An example demonstrating how to implement a Role Based Access Control (RBAC)
  system.

### Authentication and authorization related examples

- **[passport-login](https://github.com/strongloop/loopback-next/tree/master/examples/passport-login)**:
  An example implementing authentication in a LoopBack application using
  [Passport](https://github.com/jaredhanson/passport) modules.

- **[todo-jwt](https://github.com/strongloop/loopback-next/tree/master/examples/todo-jwt)**:
  A modified
  [Todo example](https://github.com/strongloop/loopback-next/tree/master/examples/todo)
  with JWT authentication.

### Other examples

- **[context](https://github.com/strongloop/loopback-next/tree/master/examples/context)**:
  Standalone examples showing how to use
  [`@loopback/context`](https://github.com/strongloop/loopback-next/tree/master/packages/context)
  as an Inversion of Control (IoC) and Dependency Injection (DI) container.

- **[file-transfer](https://github.com/strongloop/loopback-next/tree/master/examples/file-transfer)**:
  An example showing how to expose APIs to upload and download files.

- **[greeting-app](https://github.com/strongloop/loopback-next/tree/master/examples/greeting-app)**:
  An example showing how to compose an application from component and
  controllers, interceptors, and observers.

- **[multi-tenancy](https://github.com/strongloop/loopback-next/tree/master/examples/multi-tenancy)**:
  An example application to demonstrate how to implement multi-tenancy with
  LoopBack 4.

- **[rpc-server](https://github.com/strongloop/loopback-next/tree/master/examples/rpc-server)**:
  An example showing how to implement a made-up RPC protocol.

- **[rest-crud](https://github.com/strongloop/loopback-next/tree/master/examples/rest-crud)**:
  An example showing how to use `CrudRestComponent` to define default repository
  and controller classes for a model without creating those classes.

- **[validation-app](https://github.com/strongloop/loopback-next/tree/master/examples/validation-app)**:
  An example demonstrating how to add validations in a LoopBack application.

- **[webpack](https://github.com/strongloop/loopback-next/tree/master/examples/webpack)**:
  An example to bundle @loopback/core using webpack

## How to download examples

You can download the example projects using our CLI tool `lb4`:

```sh
lb4 example <example-name>
```

For example, the following command downloads the `hello-world` example into
`loopback4-example-hello-world`.

```sh
lb4 example hello-world
```

Please follow the instructions in
[Install LoopBack4 CLI](Getting-started.md#install-loopback-4-cli) if you don't
have `lb4` installed yet.

The official examples are hosted at the following urls:

- https://github.com/strongloop/loopback4-example-shopping
- https://github.com/strongloop/loopback-next/tree/master/examples

## Community examples

For examples created by the community, see the
[community examples page](Community-examples.md).
