---
lang: en
title: 'Migrating access to current context'
keywords:
  LoopBack 4, LoopBack 3, Node.js, TypeScript, OpenAPI, Migration, Extensions,
  Components
sidebar: lb4_sidebar
permalink: /doc/en/lb4/migration-extensions-current-context.html
---

{% include tip.html content="
Missing instructions for your LoopBack 3 use case? Please report a [Migration docs issue](https://github.com/strongloop/loopback-next/issues/new?labels=question,Migration,Docs&template=Migration_docs.md) on GitHub to let us know.
" %}

It's often desirable to share contextual data between different parts of an
application. For example, a REST connector calling a backend web service may
want to forward transaction (correlation) id provided in a HTTP header of the
incoming request, or perhaps an auditing component wants to access the
information about the user making the request to store it in the log.

LoopBack 3 offers three approaches:

1. The recommended solution is to explicitly pass any contextual information via
   `options` argument. Most LoopBack APIs accept (and forward) this argument and
   there are means how to initialize the `options` value based on the incoming
   request.

2. Code working at REST layer can access and store contextual information on the
   HTTP request object.

3. An experimental component
   [`loopback-context`](https://github.com/strongloop/loopback-context) uses
   continuation-local-storage to provide static per-request storage that can be
   accessed from anywhere inside a LoopBack application (an Express middleware,
   a model method, a connector, etc.).

In LoopBack 4, extensions should use `@inject` decorators to access contextual
information. For example:

- `@inject(key)` and `@inject.getter(key)` to receive values from the context
- `@inject.setter(key)` to obtain a setter function for writing values to the
  context

To keep the contextual data per-request (as opposed to per-application), the
`TRANSIENT` binding scope should be used.

Components can keep using the old `options`-based approach where it makes more
sense than Dependency Injection, typically when working with existing
`options`-based code like Repository APIs.
