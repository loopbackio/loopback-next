---
lang: en
title: 'For current LoopBack users'
keywords: LoopBack 4.0, LoopBack 4
tags:
sidebar: lb4_sidebar
permalink: /doc/en/lb4/LoopBack-3.x.html
summary:
---

LoopBack 4 is the next generation of the LoopBack framework, with a completely rewritten core foundation and significantly improved programming model. If you're an existing LoopBack user, read [Crafting LoopBack 4](Crafting-LoopBack-4.md) to understand the motivations, strategy, and innovations behind this exciting new version.

This article will help existing users understand LoopBack 4:

- How to connect LoopBack 3.x concepts to LoopBack 4 terms
- What takes to rewrite/migrate a LoopBack 3.x application to LoopBack 4
- What's new and exciting in LoopBack 4
- What's available in the beta release
- What's on the roadmap to achieve functional parity
- What you can try with the beta release

## Overview

At high-level, LoopBack 3.x applications consist of three big "parts"

  - Persistence layer (this includes talking to backend services like SOAP/REST)
  - Outwards facing REST API
  - App-wide setup - Express middleware, boot scripts, etc.

In the persistence layer, users can contribute the following artifacts:

  1. Definitions of Model data types (properties, validations)
  2. Definition of data sources
  3. Configuration of models (which datasource are they attached to)
  4. Operation hooks

At the public API side, users can define:

  1. Which built-in methods should be exposed (think of `disableRemoteMethodByName`)
  1. Custom remote methods
  2. before/after/afterError hooks at application-level
  3. before/after/afterError hooks at model-level
  4. before/after/afterError hooks at model method level

LoopBack Next was intentionally designed to allow users to choose their ORM/persistence solution, and our initial version of @loopback/repository is based on juggler 3.x. That makes it possible for users to reuse their existing model definitions, migrating their application incrementally.

## Concept/feature mapping

In Loopback 3.x (and earlier), models were responsible for both accessing data in other systems (databases, SOAP services, etc.) and providing the application's external REST API. This made it easy to quickly build a REST interface for an existing database, but difficult to customize the REST API and fine-tune it to the needs of application clients.

LoopBack v4 is moving to the well-known Model-(View-)Controller pattern, where the code responsible for data access and manipulation is separated from the code responsible for implementing the REST API.

[loopback-next-example](https://github.com/strongloop/loopback-next-example) demonstrates this loose coupling. Facade is the top-level service that serves the account summary API, and is dependent on the three services Account, Customer, and Transaction. But the facade only aggregates the calls to the three services, and is not tightly coupled with the service implementation; that's why it is independent of the three services. We can define the APIs in facade the way we want. Thus, code responsible for data access and manipulation is separated from the code responsible for implementing client side APIs.


| Concept/Feature       | LoopBack 3.x                                   | LoopBack 4                                        |
| --------------------- | ---------------------------------------------- | ------------------------------------------------- |
| Programming Language  | Built with JavaScript ES5<br>Node.js callback  | TypeScript 2.5.x & JavaScript ES2016/2017<br>Promise & Async/Await         |
| Core foundation       | Express with LoopBack extensions               | Home-grown IoC container                           |
| Model Definition      | Models can be defined with JavaScript or json  | Models can be defined with TypeScript/JavaScript/JSON           |
| Model Persistence     | A model can be attached to a datasource backed by a connector that implements CRUD operations | Repository APIs are introduced to represent persistence related operations. Repository is the binding of model metadata to a datasource |
| Model Relation        | Relations can be defined between models        | (TBA) Relations can be defined between models but they will be realized between repositories |
| Model Remoting        | JavaScript/JSON remoting metadata is used to describe method signatures and their mapping to REST/HTTP<br>Swagger specs are generated after the fact                  | Remoting metadata can be supplied by OpenAPI JSON/YAML documents or TypeScript decorators |
| API Spec              | Swagger 2.0                                    | Swagger 2.0 and OpenAPI Spec 3.0, potentially other forms such as gRPC or GraphQL |
| API Explorer          | Built-in UI based on swagger-ui (/explorer)            |  (Beta) Expose Swagger/OpenAPI specs and a browser redirect to editor.swagger.io          |
| DataSource            | JSON and JS              |  Same as 3.x          |
| Connector             | Plain JS             |  JS and TypeScript          |
| Mixin                 | Use a utility to add methods from the mixin to the target model class | Use ES2015 mixin classes pattern supported by [TypeScript 2.2 and above](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html)           |
| Middleware            | Express middleware with phase-based registration and ordering | Sequence consists of actions            |
| Remote hooks          | Before/After hooks for remote methods             | Controller-level sequence/actions            |
| Boot script           | Scripts to be invoked during bootstrapping             |  (TBD)          |
| CRUD operation hooks  | Hooks for CRUD operations             |            |
| Built-in models       | Built-in User/AccessToken/Application/ACL/Role/RoleMapping for AAA       | (TBD)           |
| Authentication        | User model as the login provider<br>loopback-component-passport             | Authentication component with extensibility to strategy providers           |
| Authorization         | Use built-in User/Application/AccessToken model for identity and ACL/Role/RoleMapping for authorization |       Authorization component     |
| Component             | A very simple implementation to configure and invoke other modules        | A fully-fledged packaging model that allows contribution of extensions from other modules             |
| Tooling               | loopback-cli and API Connect UI             | (TBA)            |


## What's new and exciting in LoopBack 4

Some of the highlights of LoopBack 4 include:

- Leverage TypeScript for better code quality and productivity
- Unify and simplify the asynchronous programming model/style around Promise and Async/Await
- Implement an IoC Container with Dependency Injection for better visibility, extensibility and composability
- Introduce Component as packaging model for extensions that can be plugged into LoopBack 4 applications
- Make everything else as components, such as REST, Authentication, and Authorization
- Divide the responsibilities of LoopBack models into
  - Controllers - to handle incoming API requests
  - Repositories - to provide access to data stores
  - Models - to define schemas for business objects
  - Services - to interact with existing REST APIs, SOAP WebServices, and other form of services/microservices
- Refactor the ORM into separate modules for different concerns

## What's in the beta release

The beta release is the first milestone of the LoopBack 4 journey. Although it's not functionally complete or ready for production use, it provides a preview of what's coming, including:

1. A new `@loopback/context` module that implements an IoC container with dependency injection
2. A new `@loopback/core` module that defines core artifacts such as application and component
3. A `@loopback/rest` component that provides top-down REST API mapping using OpenAPI/Swagger specs and controllers
4. A `@loopback/authentication` component to provide infrastructure to integrate with authentication providers
5. An experimental `@loopback/repository` module to define repository interfaces and provide a reference implementation on top of legacy `loopback-datasource-juggler` and connectors
6. Examples and tutorials

The primary target audience of the beta release is extension developers. Please check out https://github.com/strongloop/loopback4-example-log-extension.

The initial beta release provides a preview for API developers. Currently, the LoopBack CLI doesn't yet support LoopBack 4, but it will eventually. See a working application at https://github.com/strongloop/loopback-next-hello-world.

## Tentative roadmap

> Disclaimer: The release plan is tentative and it's subject to changes as the core team and community contributors make progress incrementally.

- https://github.com/strongloop/loopback-next/wiki/Upcoming-Releases

