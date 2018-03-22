---
lang: en
title: 'Using components'
keywords: LoopBack 4.0, LoopBack 4
tags:
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Using-components.html
summary:
---

Components play an important part in the extensibility of LoopBack 4.
A Component makes it easy for independent developers to contribute additional
features to LoopBack. Components serve as a vehicle to group extension
contributions such as [Context Bindings](Context.md) and various artifacts to allow easier
extensibility of your Application.

A typical LoopBack component is an [npm](https://www.npmjs.com) package
exporting a Component class which can be added to your application.

```ts
import {RestApplication} from '@loopback/rest';
import {AuthenticationComponent} from '@loopback/authentication';

const app = new RestApplication();
// Add component to Application, which provides bindings used to resolve
// authenticated requests in a Sequence.
app.component(AuthenticationComponent);
```

Components can contribute the following items:

- [Controllers](Controllers.md)
- Providers of additional [Context values](Context.md)

LoopBack 4 was built with extensibility in mind and this includes Components,
which can be allowed to contribute additional artifacts by adding a Mixin
to your Application class. This doesn't change how a Component is registered
(`app.component()`) but it enables the Component to contribute additional artifacts.
For example:

- [Repositories](Repositories.md) can be contributed by a Component by adding
  `RepositoryMixin` from `@loopback/repository` to your Application
- [Booters](Booting-an-Application.md#booters) can be contributed by a Component by adding
  `BootMixin` from `@loopback/boot` to your Application

**Note:** Always check a component's instructions to see if it requires
the use of a Mixin. A Mixin may automatically register a Component, saving you
the trouble of having to do so manually. Again it's best to check the documentation
for the given Component / Mixin.
