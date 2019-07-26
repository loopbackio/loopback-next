---
lang: en
title: 'Components'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Behind-the-scene.html
---

Here are the infrastructures that get all the artifacts working together:

- [Context](Context.md): An abstraction of states and dependencies in your
  application that LoopBack uses to manage everything. It’s a global registry
  for everything in your app (configurations, state, dependencies, classes and
  so on).
- [Binding](Binding.md): An abstraction of items managed by a context. Each
  binding has a unique key within the context and a value provider to resolve
  the key to a value.
- [Dependency Injection](Dependency-injection.md): The technique used to
  separate the construction of dependencies of a class or function from its
  behavior to keep the code loosely coupled.
- [Component](Components.md): A package that bundles one or more LoopBack
  extensions.
