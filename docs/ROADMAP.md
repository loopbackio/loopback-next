## 2020 Goals and Focus

### Goal#1 - Enable as many LoopBack 3 users to migrate to LoopBack 4 as possible

With LoopBack 3 going end-of-life at the end of 2020, we are continuing to focus
on the following areas:

- finish the migration guide to help LB3 users to migrate their applications to
  LB4
- offer some level of tooling support to make the migration easier
- fill in feature parity gaps by either implementing the features in LB4 or
  recommending a solution using existing libraries
- Integrate LoopBack 4 into IBM API Connect

### Goal#2 - Keep adopting latest technologies to stay relevant

While enhancing our core code base, we'd like to continue to explore the
possibility of using and/or integrating latest technologies with LoopBack 4.

Some of the areas we'd like to explore, but not limited to:

- messaging and pub/sub event style, e.g. Kafka, MQTT
- cloud native integration
- native support on GraphQL
- modernize the connector infrastructure and code base

### Goal#3: Nurture our community and encourage more contributions

Community contributions are vital to us. It not only accelerates our
development, but also helps building deep LoopBack knowledge in the community.

We would like to encourage community contributions by make available to the
community a list of GH issues that we want to finish in a short term by using
the `help wanted` and `2020Qx` labels.

## Q1 2020 Roadmap

### Overview

- Migration: it will continue to be our focus, including filling up the details
  to the migration guide and adding tooling to make migration easier.
- Tackle issues labelled as `bug` or `developer experience`
- Issue cleanup: take some time to triage open issues and possibly some smaller
  enhancements that we never get the time to do.

### Scope

#### Migration

- Migration guide https://github.com/strongloop/loopback-next/issues/453
  - continue the work in Q4 2019 for migrating:
    - boot scripts
    - model mixins
    - remoting hooks
- Tooling:
  - improve existing commands like `import-lb3-models`
  - add new commands (e.g. import datasources).

#### Authentication

- Auth0 example: Create a more realistic example than
  https://github.com/raymondfeng/loopback4-example-auth0.

#### API Connect / LoopBack 4 Integration

- Spike on getting APIs created from LB4 imported into APIC,
  https://github.com/strongloop/loopback-next/issues/4115

#### Create models & REST APIs dynamically at runtime

- Dynamic binding/rebinding of controllers after app start #433
- How to build models, repositories and controllers dynamically at runtime #4296
- Docs for exposing REST API of a Model with no custom classes #2740 (stretch
  goal)

#### Open Issues with `bug` or `developer experience` labels

- Would like to put more time in tackling those. Will plan it as part of the
  monthly milestone planning.

### Stretch Goals

#### From model definition to REST API with no custom repository/controller classes https://github.com/strongloop/loopback-next/issues/2036

- Add CrudRestApiBuilder to @loopback/rest-crud #3737
- Example app showing CrudRestApiBuilder #3738

#### Robust handling of ObjectID type for MongoDB https://github.com/strongloop/loopback-next/issues/3720

- Spike: robust handling of ObjectID type for MongoDB,
  https://github.com/strongloop/loopback-next/issues/3456

#### Shopping example app

- clean up authentication and authorization

---

## Q4 2019 Roadmap

### Overview

In Q4 2019, here are the stories we would like to focus on:

- wrap up on authentication and authorization stories
- continue with `Inclusion of Related Models` epic
- add more support for declarative support - From model definition to REST API
  with no custom repository/controller classes
- revisit the migration story targeting to have a migration guide

### Scope

#### Authentication

- Token based authentication in API Explorer (Spike done in Q3)
- Refactoring, https://github.com/strongloop/loopback-next/issues/1996

#### Authorization

- Update authorization tutorial
  https://github.com/strongloop/loopback-next/issues/3694
- Add authorization to shopping example,
  https://github.com/strongloop/loopback-next/issues/3695

#### Inclusion of related models

Finish the MVP scope as tracked by Epic
https://github.com/strongloop/loopback-next/issues/1352

- Reject create/update requests when data contains navigational properties
  https://github.com/strongloop/loopback-next/issues/3439
- Add inclusion resolvers to lb4 relation CLI
  https://github.com/strongloop/loopback-next/issues/3451
- Verify relation type in resolve{Relation}Metadata
  https://github.com/strongloop/loopback-next/issues/3440
- Run repository tests for PostgreSQL
  https://github.com/strongloop/loopback-next/issues/3436
- Run repository tests for Cloudant
  https://github.com/strongloop/loopback-next/issues/3437
- Blog post: announce Inclusion of related models
  https://github.com/strongloop/loopback-next/issues/3452

See the post-MVP Epic for the list of stories out of scope of the initial
release: https://github.com/strongloop/loopback-next/issues/3585

#### From model definition to REST API with no custom repository/controller classes

The Epic: https://github.com/strongloop/loopback-next/issues/2036

- Improve `defineCrudRestController` to create a named controller class
  https://github.com/strongloop/loopback-next/issues/3732
- Add `defineCrudRepositoryClass` - a helper to create a named repository class
  https://github.com/strongloop/loopback-next/issues/3733
- Model API booter & builder
  https://github.com/strongloop/loopback-next/issues/3736
- Add CrudRestApiBuilder to `@loopback/rest-crud`
  https://github.com/strongloop/loopback-next/issues/3737
- Example app showing CrudRestApiBuilder
  https://github.com/strongloop/loopback-next/issues/3738

Stretch goals:

- From relation definition to REST API with auto-generated repository/controller
  classes https://github.com/strongloop/loopback-next/issues/2483
- From datasource config to Service REST API with no proxy/controller classes
  https://github.com/strongloop/loopback-next/issues/3717

#### Migration guide

The Epic: https://github.com/strongloop/loopback-next/issues/453

- Spike 1: General runtime - see
  https://github.com/strongloop/loopback-next/issues/3718
- Spike 2: Authentication & authorization - see
  https://github.com/strongloop/loopback-next/issues/3719
- Prioritize & plan follow-up issues identified in the spikes

#### ObjectID Coercion

The Epic: https://github.com/strongloop/loopback-next/issues/3720

- `Model.toObject()` should preserve prototypes (e.g. `Date` and `ObjectID`
  values) https://github.com/strongloop/loopback-next/issues/3607
- Spike https://github.com/strongloop/loopback-next/issues/3456

#### Production deployment/logging/monitoring, https://github.com/strongloop/loopback-next/issues/1054

- Blog post showing the microservice version of shopping example and mention
  what's the gaps, https://github.com/strongloop/loopback-next/issues/3715

#### Test/Enable Node.js 12 support for connectors - https://github.com/strongloop/loopback-next/issues/3072

- loopback-connector-kv-redis
- loopback-connector-grpc

#### Preparation of CASCON workshop and poster

- Workshop "Write scalable and extensible Node.js applications using LoopBack
  4", https://pheedloop.com/cascon/site/sessions/?id=OhNsKW
- Poster "REST APIs with LoopBack 4 and OpenAPI 3",
  https://pheedloop.com/cascon/site/sessions/?id=DugCzZ

#### Infrastructure

- Fix CI for loopback@3.x. https://github.com/strongloop/loopback/issues/4252

### Stretch Goals

- Review extensions that are upvoted by lots of people.  
  https://github.com/strongloop/loopback-next/issues/512
- Support ENUM type, https://github.com/strongloop/loopback-next/issues/3033

---

## Q3 Roadmap

### Overview

---

In Q3, there are a few groups of tasks we'd like to work on:

- **Continue with the stories from Q2**: Authentication, Authorization,
  Inclusion of Related models
- **Feature parity gap**: Declarative support
- **Internal tooling/infrastructure**: support Node.js 12 in juggler &
  connectors, reduce build time, etc.
- **Juggler-next**: some groundwork to prepare us to work on juggler-next, e.g.
  spike on how the code resides affect our build process

### Scope

---

#### Authentication

- [ ] Token based authentication in API Explorer.
      [Spike](https://github.com/strongloop/loopback-next/issues/2027)
- [ ] Stretch goal: enable class level `@authenticate` decorator:
      https://github.com/strongloop/loopback-next/issues/2460

#### Authorization

- [ ] Complete the `Add authorization component` PR:
      https://github.com/strongloop/loopback.io/pull/857
- [ ] Common layer for authentication & authorization
      https://github.com/strongloop/loopback-next/issues/2900
- [ ] Add authorization to example-shopping repo

#### Inclusion of Related Models https://github.com/strongloop/loopback-next/issues/1352

- awaiting to @bajtos' spike to create the tasks

#### From model definition to REST API with no custom repository/controller classes (Declarative Support) https://github.com/strongloop/loopback-next/issues/2036

- [ ] [CRUDRESTController](https://github.com/strongloop/loopback-next/issues/2736)
- [ ] [Spike: Booter for creating REST APIs from model files](https://github.com/strongloop/loopback-next/issues/2738)

#### CI cleanup https://github.com/strongloop-internal/scrum-apex/issues/422

- [ ] Fix CI for
      [dashdb](https://github.com/strongloop/loopback-connector-dashdb/issues/76)
- [ ] Fix CI for
      [db2](https://github.com/strongloop/loopback-connector-db2/issues/130)
      connector
- [ ] Fix CI for
      [loopback-connector-postgresql](https://github.com/strongloop/loopback-connector-postgresql/issues/384)
      for Node.js 10
- [ ] Stretch goal: Test juggler 3.x and 4.x on connectors

#### Support of Node.js 12 https://github.com/strongloop/loopback-next/issues/3072

- [ ] [SQL connectors](https://github.com/strongloop/loopback-next/issues/3110)
- [ ] [noSQL connectors](https://github.com/strongloop/loopback-next/issues/3111)
- [ ] [service connectors](https://github.com/strongloop/loopback-next/issues/3112)

#### Internal tooling - to address build time

- Spike: Investigate setting up Windows CI workflow for connectors using Azure
  Pipelines, https://github.com/strongloop/loopback-next/issues/3161

#### Documentation improvement

- Tasks created according to this proposal:
  https://github.com/strongloop/loopback-next/pull/2925

#### Miscellaneous

- Review of
  [DB2 connector on IBM i](https://github.com/strongloop/loopback-connector-ibmi)

#### Bug fixes / Developer Experience Improvements

- Bugs:
  https://github.com/strongloop/loopback-next/issues?q=is%3Aopen+is%3Aissue+label%3Abug+-label%3A%22good+first+issue%22+-label%3A%22help+wanted%22

- Developer Experience (Pick a few):
  https://github.com/strongloop/loopback-next/issues?utf8=✓&q=is%3Aopen+is%3Aissue+-label%3A%22good+first+issue%22+-label%3A%22help+wanted%22+label%3Adeveloper-experience+

#### Juggler next

- Improve current juggler v4 to allow connectors to implement DAO/KVAO methods
  as async functions returning a promise (not accepting a callback).
- Rework loopback-connector from ES5 codebase to ES2017 (class keyword, async
  functions). This is a breaking change for connectors consuming this module,
  but should be done in backwards-compatible way from the point of view of LB4
  applications.
- Upgrade most (if not all) of our connectors to use the new major version of
  loopback-connector, leverage class inheritance and async functions.

### Stretch Goals

---

#### Juggler next

- Convert base repo (e.g. loopback-connector) and more popular connectors to
  TypeScript and to use async/await

#### Feature parity

- Operation hooks.
  [Spike](https://github.com/strongloop/loopback-next/issues/1919)
- REST layer improvement https://github.com/strongloop/loopback-next/issues/1452
  - controller cannot control the header and content type. use case: file
    download.
- Validation
  - Advanced validation - e.g. email validation - not supported in json schema. 
    AJV allows to support certain keywords.
    [Spike](https://github.com/strongloop/loopback-next/issues/1463).
  - AJV only validating in request body but not validating parameters, queries
  - validation in juggler

---
