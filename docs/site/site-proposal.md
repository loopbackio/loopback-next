Based on @raymondfeng's
[proposal](https://github.com/strongloop/loopback-next/pull/2925/files) on the
docs improvement, I'd like to propose the following changes.

## High-level sidebar

- **Overview**: No change. Just add a dedicated "overview" item on the sidebar.
  It still points to [index.md](index.md) file.
- **Getting Started**: no change. [Getting-started.md](Getting-started.md)
- **Tutorials**: [Tutorials.md](Tutorials.md).

- **Basic constructs**: Same as
  [Composition and responsibility of LoopBack 4 constructs for a typical application](https://github.com/strongloop/loopback-next/pull/2925)
  in the original proposal.

* [Application](Application.md)
* [Server](Server.md)
* [Controller](Controllers.md)
* Model & Model Relation: This page has a combination of [Model.md](Model.md)
  and [Relations.md](Relations.md)
  - [HasMany Relation](HasMany-relation.md)
  - [BelongsTo Relation](BelongsTo-relation.md)
  - [HasOne Relation](hasOne-relation.md)
* [Repository](Repositories.md)
* Service Proxy
* Datasource & Connectors
* Observers & Interceptors

* **Application life cycles**

  - Create: includes scaffolding and adding more artifacts
  - Build
  - Boot
  - Start
  - Stop

- **Developer Experiences**

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
  - Debugging
  - Deployment

- **Behind the scene plumbing**

  Discussion: we probably need a better term here.

  - Context
  - Binding
  - Dependency injection
  - Component

- **Request/response processing flow**

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

- **Extending LoopBack**

  - Extension point/extension
  - Discovering and ordering
  - Chain of handling

- **Examples**

  Discussion: I think Raymond (or someone) proposed to move the Examples to be
  lower in the sidebar

- **CLI References**

- **API docs**

- **For LoopBack 3.x users**

  - **Differences between v3 and v4**
  - **Migration Guide**

- **References**

  Discussion: Per discussion with Barbara much earlier, she suggested us remove
  the Glossary as well because we have the one-liner description of the
  concepts.

  - Considerations for GDPR readiness

## Proposed Changes on Individual Section

### Tutorials

The sidebar will contain all the tutorials listed in
[Tutorials.md](Tutorials.md) . If the tutorial was pointing to a README file, it
will show the README file.

### Basic Constructs

It will contain a diagram of how different basic constructs relate to each
other, besides the one-liner description like in [Concepts.md](Concepts.md)

_To be continued_
