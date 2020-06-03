---
lang: en
title: 'Migrating components and extensions'
keywords:
  LoopBack 4, LoopBack 3, Node.js, TypeScript, OpenAPI, Migration, Extensions,
  Components
sidebar: lb4_sidebar
permalink: /doc/en/lb4/migration-extensions-overview.html
redirect_from: /doc/en/lb4/migration-extensions.html
---

{% include tip.html content="
Missing instructions for your LoopBack 3 use case? Please report a [Migration docs issue](https://github.com/strongloop/loopback-next/issues/new?labels=question,Migration,Docs&template=Migration_docs.md) on GitHub to let us know.
" %}

In LoopBack 3, a component is essentially a function that extends and/or patches
the target application.

LoopBack 3 components can contribute:

- additional models
- new REST API endpoints (Express routes)
- mixin to be used by application models

They can also modify application's models to

- register new
  [Operation Hooks](https://loopback.io/doc/en/lb3/Operation-hooks.html)
- register new [Remote Hooks](https://loopback.io/doc/en/lb3/Remote-hooks.html)
- define new relations

In LoopBack 4, a component is typically a class providing artifacts it wants to
contribute to the application. It is responsibility of the target application to
import those artifacts.

LoopBack 4 components can contribute:

- [Model and Entity classes](../../Model.md)
- [Mixins](../../Mixin.md)
- [Decorators](../../Creating-decorators.md)
- [Sequence Actions](../../Sequence.md#actions)
- [Controllers](../../Controllers.md)
- [Life cycle observers](../../Extension-life-cycle.md)
- [Repositories](../../Repositories.md)
- [Service proxies](../../Calling-other-APIs-and-Web-Services.md)
- [Servers](../../Creating-servers.md)
- [HTTP request parsers](../../Extending-request-body-parsing.md)
- Extensions for [Extension Points](../../Extension-point-and-extensions.md)
  - [Booters](../../Booting-an-Application.md#custom-booters)
  - [Model API builders](../../Extending-Model-API-builder.md)
  - Extensions for Extension Points defined by 3rd-party component
- Any other values to be bound in `Application`'s context:
  - [Classes](../../Binding.md#a-class)
  - [Providers](../../Binding.md#a-provider)
  - [Arbitrary bindings](../../Binding.md) (instances of `Binding` class)

As the last resort, LoopBack 4 components can also modify the target application
directly by calling `Application` APIs (this is similar to LoopBack 3 approach).

To make the migration guide easier to navigate, we split component-related
instructions into several sub-sections.

1. [Migrating component project layout](./project-layout.md) describes how to
   migrate your LoopBack 3 extension project infrastructure to LoopBack 4 style
   and how to update the instructions for using your component.

1. [Migrating components contributing Models, Entities and Repositories](./models.md)
   explains how to migrate a LB3 component contributing Models into a LB4
   component that contributes Entites and Repositories.

1. [Migrating access to current context](./current-context.md) describes how to
   migrate code accessing contextual information shared by different parts of a
   LoopBack application.

1. [Migrating components contributing Model mixins](./mixins) explains how to
   migrate a component that's contributing Model mixins.

1. [Migrating components contributing REST API endpoints](./rest-api) explains
   how to migrate different kinds of REST API endpoints.

There is no migration guide written for the following areas yet, please up-vote
the referenced GitHub issues to let us know if you are looking for such content:

- Migrating services (local and remote):
  [loopback-next#5424](https://github.com/strongloop/loopback-next/issues/5424)

- API transports (websockets, pub/sub message consumers):
  [loopback-next#5425](https://github.com/strongloop/loopback-next/issues/5425)

- Introspection of application artifacts:
  [loopback-next#5426](https://github.com/strongloop/loopback-next/issues/5426)
