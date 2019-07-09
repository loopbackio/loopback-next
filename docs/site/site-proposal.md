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

- **Application life cycles**

  - Installation
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
    - load the artifact by convention from well know folders and populate into
      the application context
  - Start
    - `app.start()`
    - LB application does the start event
    - activation of endpoints
    - start to listen on the transport and start to accept requests
    - lifecycle event, e.g. start a timer to clean up cache periodically
  - Try and test?

    Build the app iteratively.

  - Request/Response processing
    - after start, requests can come in.
    - can start accept request and produce response
    - raymond has a diagram from server > sequence of actions> controller >
      datasource > connector
  - Stop
    - deactivate the endpoints. shutting down the application

- **Developer Experiences**

  _Development and Deployment stories_

  _show how to add more integration capabilities to your app_

  - Create REST APIs
    - Top-down vs Bottom up
    - OpenAPI
    - can expand to other APIs, e.g. gRPC and GraphQL
  - Access databases
  - Call other services
  - Integrate with infrastructure

    _If we don't have out-of-box integration, we can document how to utilize
    intercept to do the work. or create a PoC_

    - Authentication
    - Authorization
    - Caching
    - Distributed tracing
    - Metrics

  - Debugging
  - Deployment - to docker containers, kubernetes, etc.

- **Behind the scene plumbing**

  _what's the plumbing that we get all the artifacts working together_

  _what infrastructure behind the magic and how developers can use it_

  - Context
  - Binding
  - Dependency injection
  - Component - allow you to group different bindings together

- **Request/response processing flow**

  _Programming model guide: to understand what's the pipeline behind and how we
  utilize different tiers to do different work_

  It serves 2 purposes:

  1. for extension developer on how to extend LB
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

- **Extending LoopBack**

  - Extension point/extension patterns: on top of the context registry
  - Discovering and ordering: how to discover artifacts from the context, so
    that we can form a chain of interceptors/actions
  - Chain of handling
  - Creating components, decorators, servers
  - Extending request body parsing
  - Extension life cycle
  - Testing your extension

- **Examples**

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

## Proposed Changes on sidebar

Mapping the existing contents to the new sidebar structure:

- Overview (new sidebar item. it will point to index.md)
- Getting started
- Tutorials
- Basic building block
  - Application
  - Server
  - Controllers
  - Model and Model Relations
  - Repositories
  - Service Proxy (no matching content??)
  - DataSources and Connectors
  - Observers(same as `Life cycle events and observers`) and Interceptors
- Application life cycles
  - Booting an Application
- Usage scenario (better than `Developer Experience`?)
  - Create APIs
    - Top down vs bottom up (new page)
    - OpenAPI (new page)
    - Exposing GraphQL APIs
    - Self-hosted REST API Explorer
  - Access databases (new page)
    - Database migrations
  - Calling other APIs
  - Integrate with other infrastructure (new intro page)
    - Authentication
    - Authorization
  - Serving static files
  - Debugging (new page)
  - Deployment
    - Deploying to IBM Cloud
    - Deploying to Kubernetes on IBM Cloud
    - Deploying with pm2 and nginx
- Architecture
  - Context
  - Binding
  - Dependency injection
  - Components
  - Crafting LoopBack 4
- Request/Response processing flow

  - Routes
  - Sequence

- Extending LoopBack
  - Decorators
  - Error handling
- Examples
- CLI References
- API docs
- For LoopBack 3.x users
  - Differences between v3 and v4
  - Boot and Mount a LoopBack 3 Application
  - Migration guide
- Best Practices
- References

## Proposed Changes on Individual Section

### Tutorials

The sidebar will contain all the tutorials listed in
[Tutorials.md](Tutorials.md) . If the tutorial was pointing to a README file, it
will show the README file.

### Basic Constructs

1. It will contain a diagram of how different basic constructs relate to each
   other, besides the one-liner description like in [Concepts.md](Concepts.md)

_To be continued_
