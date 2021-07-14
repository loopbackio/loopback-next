---
lang: en
title: 'Sequence'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Sequence.html
---

## What is a Sequence?

A `Sequence` is a series of steps to control how a specific type of `Server`
responds to incoming requests. Each types of servers, such as RestServer,
GraphQLServer, GRPCServer, and WebSocketServer, will have its own flavor of
sequence. The sequence represents the pipeline for inbound connections.

The contract of a `Sequence` is simple: it must produce a response for a
request. The signature will vary by server types.

Each server type has a default sequence. It's also possible to create your own
`Sequence` to have full control over how your `Server` instances handle requests
and responses.

For now, we focus on `Sequence` for REST Servers, which has two flavors.

### Middleware-based sequence for REST Server

The [middleware-based sequence](REST-middleware-sequence.md) is introduced by
@loopback/rest v6.0.0. It consists of groups of cascading middleware that allow
better extensibility and composability. Newly generated LoopBack applications
use this approach by default.

### Action-based sequence for REST Server

The [action-based sequence](REST-action-sequence.md) is the default
implementation for @loopback/rest version 5.x or below. The sequence is a
generated class that contains hard-coded actions in the `handle` method and can
be modified by application developers to extend or customize the steps. It is
supported for backward compatibility and will be deprecated and removed in
future releases.
