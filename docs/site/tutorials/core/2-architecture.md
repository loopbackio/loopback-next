---
lang: en
title: 'Architectural challenges'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/core-tutorial-part2.html
---

There are interesting challenges in building complex Node.js projects such as an
open framework or a large-scale application that involves many modules,
components and teams. As platform developers, we love to have the foundation to
perform common tasks and enforce best practices without repeating ourselves. On
the other hand, we also want to give control to developers if needed to solve
the problem in their preferred ways or to bring in additional capabilities
seamlessly without breaking the foundation. This tutorial will walk you through
scenarios and strategies to allow your Node.js project to scale up with many
types of artifacts bundled in multiple npm modules, developed by different
developers and teams. To name a few such use cases:

- Customize the behavior of certain features, for example, use a different
  algorithm to hash passwords, allow a different logger function, or replace the
  built-in access control

- Extend the capabilities of your framework/application, for example, allow a
  new authentication strategy, connect to a different database, or support
  another object storage provider

- Decompose a flow/sequence of processing into actions, for example, perform
  authentication and authorization, impose rate limiting, route to corresponding
  controllers/methods, and invoke business logic to produce the response

- Compose a set of actions into a meaningful flow/sequence, for example, set up
  a pipeline to process HTTP requests/responses, or allow delegation from
  controllers to repositories/connectors to interact with databases

This tutorial examines those typical scenarios where loose coupling is critical
for various parts to work together without knowing much about one another and
introduces common patterns to solve such problems with example code:

- **Decoration and reflection**: provide metadata management to capture
  knowledge of various artifacts
- **Inversion of control and dependency injection**: manage artifacts and their
  dependencies for resolution and composition - not the same old IoC and DI -
  it's built for async!
- **Extension points and extensions**: organize artifacts with loose coupling
  and promote extensibility
- **Chain of responsibility**: align a set of action into a meaningful sequence
  or flow
- **Observation and notification**: enable (async) event driven collaboration

## LoopBack: Helps you in building large scale Node.js applications

LoopBack 4 core is an open source TypeScript platform for Node.js, specializing
in building large scale applications with great flexibility, composability, and
extensibility.

The following key modules are used by the LoopBack framework to offer API and
Microservice capabilities. They can be used independently as a base platform to
build large scale applications in TypeScript and Node.js.

- [@loopback/metadata](https://www.npmjs.com/package/@loopback/metadata)
- [@loopback/context](https://www.npmjs.com/package/@loopback/context)
- [@loopback/core](https://www.npmjs.com/package/@loopback/core)

## Design goals

Some characteristics of large scale applications are:

- Developed by many teams/developers
- Maintained for many years and releases
- Created as many modules
- Have many dependencies

Architectural disciplines that are required to support such large scale
applications, including:

- Modular/Decoupling
- Composable
- Extensible

There are conflict of interests between the two:

- Modular/Decoupling/Consistent vs. Fragmentation/Friction
- Composable vs. Extensible

## Scenario

We are going to use the
[Greeter Extension](https://github.com/strongloop/loopback-next/tree/master/examples/greeter-extension)
to illustrate how LoopBack can help you to build large scale Node.js
applications.

---

Previous:
[Part 1 - Introduction of the application scenario](./1-introduction.md)

Next: [Part 3 - Manage artifacts](./3-context-in-action.md)
