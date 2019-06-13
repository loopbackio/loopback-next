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
