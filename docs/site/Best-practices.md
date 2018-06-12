---
lang: en
title: 'Best practices with Loopback 4'
keywords: LoopBack 4.0, LoopBack 4
tags:
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Best-practices.html
redirect_from:
  - /doc/en/lb4/Best-practices-with-Loopback-4.html
summary:
---

{% include important.html content=" The API-first approach for building LoopBack
applications is not yet fully supported. Therefore, some of the sections in this
page are outdated and may not work out of the box. They will be revisited after
our MVP release.
" %}

LoopBack 4 is more than just a framework: It’s an ecosystem that encourages
developers to follow best practices through predefined standards. This section
will walk through some important guidelines by building an example API for a
catalog of products.

Our best practice follows an "API first" and test-driven development approach:

1.  **Defining the API**: There are two possible approaches to take in this
    section
    - [**Defining the API using code-first approach**](./Defining-the-API-using-code-first-approach.md):
      This section guides you through setting up a skeleton of your application
      so that its full OpenAPI specification can be automatically generated.
    - [**Defining the API using design-first approach**](./Defining-the-API-using-design-first-approach.md):
      This section guides you through constructing your API first before any
      internal logic is added. **_Not fully supported_**
      - [**Testing the API**](./Testing-the-API.md): This section describes the
        process of writing smoke test for your API and its spec. **_Not fully
        supported_**
2.  [**Defining your testing strategy**](./Defining-your-testing-strategy.md):
    This section discusses the advantages and the process of building a strong
    testing suite.
3.  [**Implementing features**](./Implementing-features.md): This section
    demonstrates how the tests for each feature of your application should be
    written, and how to write the logic to make these tests pass. In the
    example, the tests for the controller, model, repository, data source, and
    sequence are written and then implemented.
4.  [**Preparing the API for consumption**](./Preparing-the-API-for-consumption.md):
    This section shows how the endpoints can be physically tested using the
    Swagger UI.
