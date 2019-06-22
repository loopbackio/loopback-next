---
lang: en
title: 'Understanding the differences between LoopBack 3 and LoopBack 4'
keywords: LoopBack 4.0, LoopBack 4, LoopBack 3
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Understanding-the-differences.html
---

This article will help existing users understand LoopBack 4:

- How to connect LoopBack 3.x concepts to LoopBack 4 terms
- What's new and exciting in LoopBack 4

## Overview

At high-level, LoopBack 3.x applications consist of three big "parts"

- Persistence layer (this includes talking to backend services like SOAP/REST)
- Outwards facing REST API
- App-wide setup - Express middleware, boot scripts, etc.

In the persistence layer, users can contribute the following artifacts:

1.  Definitions of Model data types (properties, validations)
2.  Definition of data sources
3.  Configuration of models (which datasource are they attached to)
4.  Operation hooks

At the public API side, users can define:

1.  Which built-in methods should be exposed (think of
    `disableRemoteMethodByName`)
2.  Custom remote methods
3.  before/after/afterError hooks at application-level
4.  before/after/afterError hooks at model-level
5.  before/after/afterError hooks at model method level

LoopBack 4 was intentionally designed to allow users to choose their own
ORM/persistence solution. The juggler from LoopBack 3 has been packaged into
`@loopback/repository` so that it's possible for users to reuse their existing
model definitions, migrating their application incrementally.

## Concept/feature mapping

In Loopback 3.x (and earlier), models were responsible for both accessing data
in other systems (databases, SOAP services, etc.) and providing the
application's external REST API. This made it easy to quickly build a REST
interface for an existing database, but difficult to customize the REST API and
fine-tune it to the needs of application clients.

LoopBack 4 is moving to the well-known Model-(View-)Controller pattern, where
the code responsible for data access and manipulation is separated from the code
responsible for implementing the REST API.

[loopback4-example-microservices](https://github.com/strongloop/loopback4-example-microservices)
demonstrates this loose coupling. Facade is the top-level service that serves
the account summary API, and is dependent on the three services Account,
Customer, and Transaction. But the facade only aggregates the calls to the three
services, and is not tightly coupled with the service implementation; that's why
it is independent of the three services. We can define the APIs in facade the
way we want. Thus, code responsible for data access and manipulation is
separated from the code responsible for implementing client side APIs.

| Concept/Feature      | LoopBack 3.x                                                                                                                                         | LoopBack 4                                                                                                                                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Programming Language | Built with JavaScript ES5<br>Node.js callback                                                                                                        | TypeScript 2.6.x & JavaScript ES2016/2017<br>Promise & Async/Await                                                                                                                                          |
| Core foundation      | Express with LoopBack extensions                                                                                                                     | Home-grown IoC container                                                                                                                                                                                    |
| Model Definition     | Models can be defined with JavaScript or JSON                                                                                                        | Models can be defined with TypeScript/JavaScript/JSON(TBA)                                                                                                                                                  |
| Model Persistence    | A model can be attached to a datasource backed by a connector that implements CRUD operations                                                        | [Repositories](https://github.com/strongloop/loopback-next/tree/master/packages/repository) are introduced to represent persistence related operations; a repository binds a model metadata to a datasource |
| Model Relation       | Relations can be defined between models                                                                                                              | (TBA) Relations can be defined between models but they will be realized between repositories                                                                                                                |
| Model Remoting       | JavaScript/JSON remoting metadata is used to describe method signatures and their mapping to REST/HTTP<br>Swagger specs are generated after the fact | Remoting metadata can be supplied by OpenAPI JSON/YAML documents or generated automatically through TypeScript decorators                                                                                   |
| API Spec             | Swagger 2.0                                                                                                                                          | OpenAPI Spec 3.0 and potentially other API specs such as GraphQL, gRPC, etc.                                                                                                                                |
| API Explorer         | Built-in UI based on swagger-ui (/explorer)                                                                                                          | (Beta) Expose OpenAPI specs and a browser redirect to Swagger UI hosted by loopback.io                                                                                                                      |
| DataSource           | JSON and JS                                                                                                                                          | JSON/JS/TypeScript                                                                                                                                                                                          |
| Connector            | Plain JS                                                                                                                                             | JS and TypeScript (TBA)                                                                                                                                                                                     |
| Mixin                | Use a utility to add methods from the mixin to the target model class                                                                                | Use ES2015 mixin classes pattern supported by [TypeScript 2.2 and above](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html)                                                    |
| Middleware           | Express middleware with phase-based registration and ordering                                                                                        | Sequence consisting of actions                                                                                                                                                                              |
| Boot script          | Scripts to be invoked during bootstrapping                                                                                                           | (TBD)                                                                                                                                                                                                       |
| Remote hooks         | Before/After hooks for remote methods                                                                                                                | Sequence/actions                                                                                                                                                                                            |
| CRUD operation hooks | Hooks for CRUD operations                                                                                                                            | Sequence/actions                                                                                                                                                                                            |
| Built-in models      | Built-in User/AccessToken/Application/ACL/Role/RoleMapping for AAA                                                                                   | (TBD)                                                                                                                                                                                                       |
| Authentication       | User model as the login provider<br>loopback-component-passport                                                                                      | (TBA) Authentication component ([@loopback/authentication](https://github.com/strongloop/loopback-next/tree/master/packages/authentication)) with extensibility to strategy providers                       |
| Authorization        | Use built-in User/Application/AccessToken model for identity and ACL/Role/RoleMapping for authorization                                              | (TBD) Authorization component                                                                                                                                                                               |
| Component            | A very simple implementation to configure and invoke other modules                                                                                   | A fully-fledged packaging model that allows contribution of extensions from other modules                                                                                                                   |
| Tooling              | loopback-cli and API Connect UI                                                                                                                      | [@loopback/cli](https://github.com/strongloop/loopback-next/tree/master/packages/cli)                                                                                                                       |

## What's new and exciting in LoopBack 4

Some of the highlights of LoopBack 4 include:

- Leverage TypeScript for better code quality and productivity
- Unify and simplify the asynchronous programming model/style around Promise and
  Async/Await
- Implement an IoC Container with Dependency Injection for better visibility,
  extensibility and composability
- Introduce Component as packaging model for extensions that can be plugged into
  LoopBack 4 applications
- Make everything else as components (REST, Authentication, and Authorization)
- Divide the responsibilities of LoopBack models into
  - Controllers: handle incoming API requests
  - Repositories: provide access to datasources
  - Models: define schemas for business objects
  - Services: interact with existing REST APIs, SOAP Web Services, and other
    forms of services/microservices
- Refactor the ORM into separate modules for different concerns

As LoopBack 4 continues to grow, more features are continuously added. You can
check out our [blog](https://strongloop.com/strongblog/tag_LoopBack.html) to
keep up with these new features.
