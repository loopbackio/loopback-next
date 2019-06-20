Based on @raymondfeng's
[proposal](https://github.com/strongloop/loopback-next/pull/2925/files) on the
docs improvement, I'd like to propose the following changes.

## High-level sidebar

- **Overview**: No change. Just add a dedicated "overview" item on the sidebar.
  It still points to [index.md](index.md) file.
  - high level overview
- **Getting Started**: no change. [Getting-started.md](Getting-started.md)
- **Tutorials**: [Tutorials.md](Tutorials.md).
- **Inside a LoopBack 4 application**

  _as a typical LoopBack 4 application (a concrete scenario), how a typical LB
  application looks like and what are the building blocks and how they fit into
  the LB application._

- **Basic building blocks**

  Same as
  [Composition and responsibility of LoopBack 4 constructs for a typical application](https://github.com/strongloop/loopback-next/pull/2925)
  in the original proposal.

  _need a diagram that shows the relationship among all the building blocks. it
  shows:_

  - logical composition of the building blocks (diagram 1)
  - how the request flow through different tiers (diagram 2)

  Subitems include:

  - [Application](Application.md)
  - [Server](Server.md)
  - [Controller](Controllers.md)
  - Model & Model Relation: This page has a combination of [Model.md](Model.md)
    and [Relations.md](Relations.md)
    - [HasMany Relation](HasMany-relation.md)
    - [BelongsTo Relation](BelongsTo-relation.md)
    - [HasOne Relation](hasOne-relation.md)
  - [Repository](Repositories.md)
  - Service Proxy
  - Datasource & Connectors
  - Observers & Interceptors

**Application life cycles**

- Create: includes scaffolding
  - download the cli module
  - create project skeleton
  - scaffold application, create model, add business logics in controller.
- Add more artifacts
  - start to add building blocks
- Build
  - part of `npm start`
  - build step will transpile everything to javascript
- Boot
  - `app.boot()`
  - load the artifact by convention from well know folders and populate into the
    application context
- Start
  - `app.start()`
  - LB application does the start event
  - activation of endpoints
  - start to listen on the transport and start to accept requests
  - lifecycle event, e.g. start a timer to clean up cache periodically
- Request/Response processing
  - after start, requests can come in.
  - can start accept request and produce response
  - raymond has a diagram from server > sequence of actions> controller >
    datasource > connector
- Stop
  - deactivate the endpoints. shutting down the application

**Developer Experiences**

_Development and Deployment stories_

_show how to add more integration capabilities to your app_

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

**Behind the scene plumbing**

_what's the plumbing that we get all the artifacts working together_

- Context
- Binding
- Dependency injection
- Component

**Request/response processing flow**

_Programming model guide_

It serves 2 purposes:

1. for extension devloper on how to extend LB
2. for application developer to understand the processing flow

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

**Extending LoopBack**

- Extension point/extension
- Discovering and ordering
- Chain of handling

**Examples**

**CLI References**

**API docs**

**For LoopBack 3.x users**

- **Differences between v3 and v4**
- **Migration Guide**

**References**

Discussion: Per discussion with Barbara much earlier, she suggested us remove
the Glossary as well because we have the one-liner description of the concepts.

- Considerations for GDPR readiness

## Proposed Changes on Individual Section

### Tutorials

The sidebar will contain all the tutorials listed in
[Tutorials.md](Tutorials.md) . If the tutorial was pointing to a README file, it
will show the README file.

### Basic Constructs

1. It will contain a diagram of how different basic constructs relate to each
   other, besides the one-liner description like in [Concepts.md](Concepts.md)

_To be continued_
