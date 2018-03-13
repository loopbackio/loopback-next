---
lang: en
title: 'Best practices with Loopback 4'
keywords: LoopBack 4.0, LoopBack 4
tags:
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Best-practices-with-Loopback-4.html
summary:
---

LoopBack 4 is more than just a framework: It’s an ecosystem that encourages developers to follow best practices through predefined standards. This section will walk through some important guidelines by building an example API for a catalog of products.

Our best practice follows an "API first" and test-driven development approach:

1. [**Defining and validating the API**](./Defining-and-validating-the-API.md): This section guides you through constructing your API first before any internal logic is added.
2. [**Testing the API**](./Testing-the-API.md): This section describes the process of writing smoke test for your API and its spec.
3. [**Defining your testing strategy**](./Defining-your-testing-strategy.md): This section discusses the advantages and the process of building a strong testing suite.
4. [**Implementing features**](./Implementing-features.md): This section demonstrates how the tests for each feature of your application should be written, and how to write the logic to make these tests pass. In the example, the tests for the controller, model, repository, data source, and sequence are written and then implemented.
5. [**Preparing the API for consumption**](./Preparing-the-API-for-consumption.md): This section shows how the endpoints can be physically tested using the Swagger UI.
