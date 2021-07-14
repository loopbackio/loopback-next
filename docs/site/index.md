---
lang: en
title: LoopBack 4
toc: false
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI
sidebar: lb4_sidebar
permalink: /doc/en/lb4/index.html
summary: LoopBack is a platform for building APIs and microservices in Node.js
---

## Overview

LoopBack is an
[award-winning](https://strongloop.com/strongblog/loopback-2019-api-award-api-middleware/),
highly extensible, open-source Node.js and TypeScript framework based on
Express. It enables you to quickly create APIs and microservices composed from
backend systems such as databases and SOAP or REST services.

The diagram below demonstrates how LoopBack serves as a composition bridge
between incoming requests and outgoing integrations. It also shows the different
personas who are interested in various capabilities provided by LoopBack.

![LoopBack 4 Overview](./imgs/lb4-high-level.png)

### Built for API developers

- Define your API endpoints and schemas using the
  [OpenAPI](https://www.openapis.org/) standard.
- Write your endpoints in modern JavaScript using ES2017, `async` / `await`,
  modules.
- Use your defined endpoints and schemas as the source of truth without
  generating code.

### Built for teams

- Review changes to API endpoints without digging through JavaScript.
- Maintain consistency by automating the validation of your endpoints and
  schemas.
- First class support for [TypeScript](https://www.typescriptlang.org) (strongly
  typed JavaScript).

### Built for your platform

- Use LoopBack as a starting point for your own framework or platform.
- Build libraries of reusable components in a standardized way.
- Integrate with databases, web services, and other platforms using connectors.

## How is our documentation organized

We use the the [Diátaxis documentation authoring framework](https://diataxis.fr)
which organizes technical documentation into a system based on four quadrants:

- Learning-oriented `Tutorials` provide hands-on lessons where users can learn
  the framework by doing.

- Problem-oriented `How-to Guides` provide recipes to solve specific goals you
  may encounter while building a LoopBack project.

- Understanding-oriented `Concepts` pages provide the explanation of
  architecture concepts, wider view and deeper knowledge about the framework.

- Information-oriented `Reference guides` provide technical description of the
  machinery and how to use it.
