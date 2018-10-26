---
lang: en
title: 'Life cycle events and observers'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Life-cycle.html
---

## Overview

A LoopBack application has its own life cycles at runtime. There are two methods
to control the transition of states of `Application`.

- start(): Start the application
- stop(): Stop the application

It's often desirable for various types of artifacts to participate in the life
cycles and perform related processing upon `start` and `stop`. Good examples of
such artifacts are:

- Servers

  - start: Starts the HTTP server listening for connections.
  - stop: Stops the server from accepting new connections.

- Components

  - A component can register life cycle observers

- DataSources

  - connect: Connect to the underlying database or service
  - disconnect: Disconnect from the underlying database or service

- Custom scripts
  - start: Custom logic to be invoked when the application starts
  - stop: Custom logic to be invoked when the application stops

## The `LifeCycleObserver` interface

To react on life cycle events, a life cycle observer implements the
`LifeCycleObserver` interface.

```ts
import {ValueOrPromise} from '@loopback/context';

/**
 * Observers to handle life cycle start/stop events
 */
export interface LifeCycleObserver {
  start?(): ValueOrPromise<void>;
  stop?(): ValueOrPromise<void>;
}
```

Please note all methods are optional so that an observer can opt in certain
events. Each main events such as `start` and `stop` are further divided into
three sub-phases to allow the multiple-step processing.

## Register a life cycle observer

A life cycle observer can be registered by calling `lifeCycleObserver()` of the
application. It binds the observer to the application context with a special
tag - `CoreTags.LIFE_CYCLE_OBSERVER`.

```ts
app.lifeCycleObserver(MyObserver);
```

Please note that `app.server()` automatically registers servers as life cycle
observers.

Life cycle observers can be registered via a component too:

```ts
export class MyComponentWithObservers {
  lifeCycleObservers: [XObserver, YObserver];
}
```

## Discover life cycle observers

The `Application` finds all bindings tagged with `CoreTags.LIFE_CYCLE_OBSERVER`
within the context chain and resolve them as observers to be notified.

## Notify life cycle observers of start/stop related events by order

There may be dependencies between life cycle observers and their order of
processing for `start` and `stop` need to be coordinated. For example, we
usually start a server to listen on incoming requests only after other parts of
the application are ready to handle requests. The stop sequence is typically
processed in the reverse order. To support such cases, we introduce
two-dimension steps to control the order of life cycle actions.

### Observer groups

First of all, we allow each of the life cycle observers to be tagged with a
group. For example:

- datasource

  - connect/disconnect
  - mongodb
  - mysql

- server
  - rest
  - gRPC

We can then configure the application to trigger observers group by group as
configured by an array of groups in order such as `['datasource', 'server']`.
Observers within the same group can be notified in parallel.

For example,

```ts
app
  .bind('observers.MyObserver')
  .toClass(MyObserver)
  .tag({
    [CoreTags.LIFE_CYCLE_OBSERVER_GROUP]: 'g1',
  })
  .apply(asLifeCycleObserverBinding);
```

The observer class can also be decorated with `@bind` to provide binding
metadata.

```ts
@bind(
  {
    tags: {
      [CoreTags.LIFE_CYCLE_OBSERVER_GROUP]: 'g1',
    },
  },
  asLifeCycleObserverBinding,
)
export class MyObserver {
  // ...
}

app.add(createBindingFromClass(MyObserver));
```

The order of observers are controlled by a `groupsByOrder` property of
`LifeCycleObserverRegistry`, which receives its options including the
`groupsByOrder` from `CoreBindings.LIFE_CYCLE_OBSERVER_OPTIONS`. Thus the
initial `groupsByOrder` can be set as follows:

```ts
app
  .bind(CoreBindings.LIFE_CYCLE_OBSERVER_OPTIONS)
  .to({groupsByOrder: ['g1', 'g2', 'server']});
```

Or:

```ts
const registry = await app.get(CoreBindings.LIFE_CYCLE_OBSERVER_REGISTRY);
registry.setGroupsByOrder(['g1', 'g2', 'server']);
```

Observers are sorted using `groupsByOrder` as the relative order. If an observer
is tagged with a group that are not in `groupsByOrder`, it will come before any
groups within `groupsByOrder`. Such custom groups are also sorted by their names
alphabetically.

In the example below, `groupsByOrder` is set to `['g1', 'g2']`. Given the
following observers:

- 'my-observer-1' ('g1')
- 'my-observer-2' ('g2')
- 'my-observer-4' ('2-custom-group')
- 'my-observer-3' ('1-custom-group')

The sorted observer groups will be:

```ts
{
  '1-custom-group': ['my-observer-3'],
  '2-custom-group': ['my-observer-4'],
  'g1': ['my-observer-1'],
  'g2': ['my-observer-2'],
}
```

### Event phases

It's also desirable for certain observers to do some processing before, upon, or
after the `start` and `stop` events. To allow that, we notify each observer in
three phases:

- start: preStart, start, and postStart
- stop: preStop, stop, and postStop

Combining groups and event phases, it's flexible to manage multiple observers so
that they can be started/stopped gracefully in order.

For example, with a group order as `['datasource', 'server']` and three
observers registered as follows:

- datasource group: MySQLDataSource, MongoDBDataSource
- server group: RestServer

The start sequence will be:

1. MySQLDataSource.preStart
2. MongoDBDataSource.preStart
3. RestServer.preStart

4. MySQLDataSource.start
5. MongoDBDataSource.start
6. RestServer.start

7. MySQLDataSource.postStart
8. MongoDBDataSource.postStart
9. RestServer.postStart

## Add custom life cycle observers by convention

Each application can have custom life cycle observers to be dropped into
`src/observers` folder as classes implementing `LifeCycleObserver`.

During application.boot(), such artifacts are discovered, loaded, and bound to
the application context as life cycle observers. This is achieved by a built-in
`LifeCycleObserverBooter` extension.

## CLI command

To make it easy for application developers to add custom life cycle observers,
we introduce `lb4 observer` command as part the CLI.

To add a life cycle observer:

1. cd <my-loopback4-project>
2. lb4 observer

```
? Observer name: Hello
   create src/observers/my.hello-observer.ts
   update src/observers/index.ts

Observer Hello was created in src/observers/
```

The generated class looks like:

```ts
import {bind} from '@loopback/context';
import {
  /* inject, Application, */
  CoreBindings,
  LifeCycleObserver,
} from '@loopback/core';

/**
 * This class will be bound to the application as a `LifeCycleObserver` during
 * `boot`
 */
@bind({tags: {[CoreBindings.LIFE_CYCLE_OBSERVER_GROUP]: ''}})
export class HelloObserver implements LifeCycleObserver {
  /*
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) private app: Application,
  ) {}
  */

  /**
   * This method will be invoked when the application starts
   */
  async start(): Promise<void> {
    // Add your logic for start
  }

  /**
   * This method will be invoked when the application stops
   */
  async stop(): Promise<void> {
    // Add your logic for start
  }
}
```
