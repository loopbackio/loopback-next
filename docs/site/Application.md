---
lang: en
title: 'Application'
keywords:
  LoopBack 4.0, LoopBack 4, Node.js, TypeScript, Application, Configuring
  Applications
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Application.html
---

## What is an Application?

In LoopBack 4, the
[`Application`](https://loopback.io/doc/en/lb4/apidocs.core.application.html)
class is the central class for setting up all of your module's components,
controllers, servers and bindings. The `Application` class extends
[Context](Context.md) and provides the controls for starting and stopping itself
and its associated servers.

When using LoopBack 4, we strongly encourage you to create your own subclass of
`Application` to better organize your configuration and setup.

## Common tasks

- [Configuring Applications](Configuring-applications.md)
