---
lang: en
title: 'Extension life cycle'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Extension-life-cycle.html
---

## Extension life cycle

As described in [Life cycle](Life-cycle.md), a LoopBack
[Application](Application.md) has its own life cycles at runtime. Corresponding
events such as `start` and `stop` are emitted upon the state change. Please note
that LoopBack only support `start` and `stop` events for an application's life
cycles at this moment.

Extension modules for LoopBack often contribute artifacts such as servers,
datasources, and connectors to the application. They typically provide a
component to bind such artifacts to the context together. Being able to listen
on life cycle events is important for extension modules to collaborate with the
application.

An extension module follows the same way as applications to implement and
register life cycle observers.

### Implement a life cycle observer

A life cycle observer class optionally implements `start` and `stop` methods to
be invoked upon `start` and `stop` events emitted by an application's life cycle
respectively.

```ts
import {LifeCycleObserver} from '@loopback/core';

export class MyLifeCycleObserver implements LifeCycleObserver {
  start() {
    // It can return `void` or `Promise<void>`
  }
  stop() {
    // It can return `void` or `Promise<void>`
  }
}
```

A life cycle observer can be tagged with `CoreTags.LIFE_CYCLE_OBSERVER_GROUP` to
indicate its group to be invoked for ordering. We can decorate the observer
class with `@lifeCycleObserver` to provide more metadata for the binding.

```ts
import {lifeCycleObserver} from '@loopback/core';

@lifeCycleObserver('g1')
export class MyLifeCycleObserver {
  // ...
}
```

### Register a life cycle observer

A life cycle observer can be registered by calling `lifeCycleObserver()` of the
application. It binds the observer to the application context with a special
tag - `CoreTags.LIFE_CYCLE_OBSERVER`.

```ts
app.lifeCycleObserver(MyObserver);
```

Life cycle observers can be declared via a component class too. when the
component is mounted to an application, the observers are automatically
registered.

```ts
export class MyComponentWithObservers implements Component {
  lifeCycleObservers = [XObserver, YObserver];
}

// Mount the component
app.mount(MyComponentWithObservers);
// Now `XObserver` and `YObserver` are registered in the application.
```
