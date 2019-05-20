---
lang: en
title: Site improvement
keywords: LoopBack 4.0
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Site-improvement.html
summary: Proposed improvement for LoopBack 4 documentation site
---

## What needs to be improved

The current [LoopBack 4 documentation](https://loopback.io/doc/en/lb4/) has a
lot of information but it is not well organized to help developers learn
LoopBack 4 concepts/features/techniques and effectively apply them to build APIs
or Micro-services with the framework.

Here are some observations by community members and ourselves:

1. The sidebar does not automatically expand with second-level items, which are
   important to facilitate navigation.

2. There are many concepts - but not organized in context to help developers see
   the big picture (high-level and/or deep-dive).

3. There are not enough diagrams to visualize the building blocks.

4. The flow of navigation does not align well with how developers build
   applications step by step.

## Some ideas to explore

- (High-level overview) Composition and responsibility of LoopBack 4 constructs
  for a typical application

  - application
  - server
  - controller
  - model/relation
  - repository
  - service proxy
  - datasource/connector
  - observers/interceptors

- (High-level overview) Life cycles

  - Scaffold (CLI)
  - Add more artifacts (CLI or VSCode)
  - Build (npm scripts)
  - Boot (application.boot)
  - Start (application.start)
  - Stop (application.stop)

- (High-level overview) Narratives for developer experiences

  - Create REST APIs

    - Top-down vs Bottom up
    - OpenAPI

  - Access databases
  - Call other services
  - Integrate with infrastructure

    - Authentication
    - Authorization
    - Caching
    - Distributed tracing
    - ...

  - Debugging
  - Deployment

- (Deep dive - behind the scene plumbing) The magic `Context` - Inversion of
  Control (IoC) container and Dependency Injection (DI) framework

  - Context

    - A registry of bindings
    - A hierarchy of contexts
    - Add/remove entries
    - Find entries
      - By key
      - By tags
    - Observe entries
    - Resolve bound value(s)

  - Binding

    - An entry in the registry
    - Key/tags/scope
    - How is a value fulfilled
      - Constant (to)
      - A factory function (toDynamicValue)
      - A class to instantiate (toClass)
      - A class to provide the value (toProvider)
      - An alias to another binding
    - Configure a binding
      - Fluent APIs
      - BindingTemplate functional programming

  - Dependency injection

    - Sync vs. Async (ValueOrPromise)
    - Only applicable to classes and their members
    - Constructor dependency injection/property dependency injection/method
      parameter dependency injection
    - Decorators
      - `@inject.*`
      - Create your own decorator for injection
    - Create your own `resolve`
    - Detect circular dependencies

  - Component
    - Contribution of bindings

- (Deep dive - the pipeline) Request/response processing flow

  - Transport -> Server -> Sequence of actions -> Controller -> Repository ->
    DataSource -> Connector -> Database
  - Express middleware
  - Sequence of actions
    - Routing
    - Parsing
    - Invoking
    - Sending
    - Rejecting
  - Interceptors

- (Deep dive - the patterns) Extensibility
  - Extension point/extension
  - Discovering and ordering
  - Chain of handling
