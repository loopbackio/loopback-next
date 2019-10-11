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

<table>
<thead>
<tr>
  <th>Concept/Feature</th>
  <th>LoopBack 3.x</th>
  <th>LoopBack 4</th>
</tr>
</thead>
<tbody>

<tr>
  <td>Programming Language</td>
  <td>Built with JavaScript ES5<br>Node.js callbacks</td>
  <td>Modern TypeScript with latest JavaScript features
    <br>Promises & async/await, ES2016/2017 and beyond
  </td>
</tr>

<tr>
  <td>Core foundation</td>
  <td>Express with LoopBack extensions</td>
  <td>Home-grown IoC container</td>
</tr>

<tr>
  <td>Tooling</td>
  <td><code>loopback-cli</code> and API Connect UI</td>
  <td><a href="Command-line-interface.html"><code>@loopback/cli</code></a></td>
</tr>

<tr>
  <td>Model Definition</td>
  <td>Models can be defined with JavaScript or JSON</td>
  <td>Models can be defined with TypeScript;
    <br>TBD: JavaScript - see
    <a href="https://github.com/strongloop/loopback-next/issues/560">loopback-next#560</a>
  </td>
</tr>

<tr>
  <td>Model Persistence</td>
  <td>A model can be attached to a datasource backed by a connector that
    implements CRUD operations
  </td>
  <td><a href="Repositories.html">Repositories</a> are introduced to represent
    persistence related operations; a repository binds a model metadata
    to a datasource
  </td>
</tr>

<tr>
  <td>Model Relation</td>
  <td>Relations can be defined between models</td>
  <td>Relations can be defined between models; queries and persistence are
    implemented at repository level
  </td>
</tr>

<tr>
  <td>Model Remoting</td>
  <td>JavaScript/JSON remoting metadata is used to describe method signatures
    and their mapping to REST/HTTP
    <br>Swagger specs are generated after the fact
  </td>
  <td>Remoting metadata can be supplied by OpenAPI JSON/YAML documents or
    generated automatically through TypeScript decorators
  </td>
</tr>

<tr>
  <td>API Spec</td>
  <td>Swagger 2.0</td>
  <td>OpenAPI Spec v3 and potentially other API specs such as GraphQL, gRPC, etc.</td>
</tr>

<tr>
  <td>API Explorer</td>
  <td>Built-in UI based on swagger-ui v2 (<code>/explorer</code>)</td>
  <td>Built-in UI based on swagger-ui v3 (<code>/explorer</code>)</td>
</tr>

<tr>
  <td>DataSource</td>
  <td>JSON</td>
  <td>TypeScript and JSON;
    <br>TBD: JavaScript - see
    <a href="https://github.com/strongloop/loopback-next/issues/560">loopback-next#560</a>
  </td>
</tr>

<tr>
  <td>Connectors</td>
  <td>Plain JavaScript, ES5 with callbacks</td>
  <td>Plain JavaScript, ES5 with callbacks;
    <br>TBD: TypeScript with async/await - see
    <a href="https://github.com/strongloop/loopback-next/issues/889">loopback-next#889</a>
  </td>
</tr>

<tr>
  <td>Mixins</td>
  <td>Use a utility to add methods from the mixin to the target model class</td>
  <td>Use ES2015 mixin classes pattern supported by
    <a href="https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html">TypeScript 2.2 and above</a>
  </td>
</tr>

<tr>
  <td>Middleware</td>
  <td>Express middleware with phase-based registration and ordering</td>
  <td>Sequence consisting of actions;
    <br>TBD: support for Express middleware, see
    <a href="https://github.com/strongloop/loopback-next/issues/1293">loopback-next#1293</a>
    and
    <a href="https://github.com/strongloop/loopback-next/issues/2035">loopback-next#2035</a>.
  </td>
</tr>

<tr>
  <td>Boot script</td>
  <td>Scripts to be invoked during bootstrapping</td>
  <td><a href="Life-cycle.html">Life cycle events and observers</a></td>
</tr>

<tr>
  <td>Remote hooks</td>
  <td>Before/After hooks for remote methods</td>
  <td><a href="Interceptors.html">Interceptors</a></td>
</tr>

<tr>
  <td>CRUD operation hooks</td>
  <td>Hooks for CRUD operations</td>
  <td>(TBD)</td>
</tr>

<tr>
  <td>Built-in models</td>
  <td>Built-in User/AccessToken/Application/ACL/Role/RoleMapping for AAA</td>
  <td>(TBD)</td>
</tr>

<tr>
  <td>Authentication</td>
  <td>User model as the login provider<br>loopback-component-passport</td>
  <td><a href="Loopback-component-authentication.html">Authentication component</a>
    with extensibility to strategy providers
  </td>
</tr>

<tr>
  <td>Authorization</td>
  <td>Use built-in User/Application/AccessToken model for identity and
    ACL/Role/RoleMapping for authorization
  </td>
  <td><a href="Loopback-component-authorization.html">Authorization component</a>
    (work in progress).
  </td>
</tr>

<tr>
  <td>Component</td>
  <td>A very simple implementation to configure and invoke other modules</td>
  <td>A fully-fledged packaging model that allows contribution of extensions
    from other modules
  </td>
</tr>

<tr>
  <td>Storage component</td>
  <td><a href="/doc/en/lb3/Storage-component.html"><code>loopback-compontent-storage</code></a>
  </td>
  <td>not available</td>
</tr>

<tr>
  <td>Push notifications</td>
  <td><a href="/doc/en/lb3/Push-notifications.html"><code>loopback-component-push</code></a>
  </td>
  <td>not available</td>
</tr>

<tr>
  <td>OAuth 2.0 provider</td>
  <td><a href="/doc/en/lb3/OAuth-2.0.html"><code>loopback-component-oauth2</code></a>
  </td>
  <td>(TBD)</td>
</tr>

<tr>
  <td>3rd-party logins via Passport</td>
  <td><a href="/doc/en/lb3/Third-party-login-using-Passport.html"><code>loopback-component-passport</code></a>
  </td>
  <td><a href="https://github.com/strongloop/loopback-next/tree/master/extensions/authentication-passport"><code>@loopback/authentication-passport</code></a>
    <br>(EXPERIMENTAL)
  </td>
</tr>

<tr>
  <td>Offline synchronization</td>
  <td><a href="/doc/en/lb3/Synchronization.html">Synchronization component</a>
    (EXPERIMENTAL)
  </td>
  <td>not available</td>
</tr>

<tr>
  <td>Client SDKs</td>
  <td>
    <a href="/doc/en/lb3/AngularJS-JavaScript-SDK.html">AngularJS (1.x)</a>,
    <a href="/doc/en/lb3/Android-SDK.html">Android</a>,
    <a href="/doc/en/lb3/iOS-SDK.html">iOS</a>,
    <a href="/doc/en/lb3/Xamarin-SDK.html">Xamarin</a>,
    <a href="/doc/en/lb3/LoopBack-in-the-client.html">Isomorphic JavaScript</a>
  </td>
  <td>
    OpenAPI code generators, e.g.
    <a href="https://swagger.io/tools/swagger-codegen/"><code>swagger-codegen</code></a>,
    <a href="https://github.com/OpenAPITools/openapi-generator"><code>openapi-generator</code></a> or
    <a href="https://github.com/cyclosproject/ng-openapi-gen"><code>ng-openapi-gen</code></a>
  </td>
</tr>

</tbody>
</table>

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
- Refactor the ORM into separate modules for different concerns (TBD)

As LoopBack 4 continues to grow, more features are continuously added. You can
check out our [blog](https://strongloop.com/strongblog/tag_LoopBack.html) to
keep up with these new features.
