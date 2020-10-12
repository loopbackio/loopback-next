---
lang: en
title: 'Life cycle observer generator'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Life-cycle-observer-generator.html
---

{% include content/generator-create-app.html lang=page.lang %}

### Synopsis

Adds a new [LifeCycleObserver](Life-cycle.md) class to a LoopBack application.

```sh
lb4 observer [--group <group>] [<name>]
```

### Arguments and options

`<name>` - Required name of the observer to create as an argument to the
command. If provided, the tool will use that as the default when it prompts for
the name.

`--group <group>` - Optional name of the observer group to sort the execution of
observers by group.

### Interactive Prompts

The tool will prompt you for:

- **Name of the observer.** _(observerName)_ If the name had been supplied from
  the command line, the prompt is skipped.

- **Group of the observer.** _(groupName)_ If the group had been supplied from
  the command line, the prompt is skipped.

### Output

Once all the prompts have been answered, the CLI will do the following:

- Create a LifeCycleObserver class as follows:
  `/src/observers/${observerName}.observer.ts`
- Update `/src/observers/index.ts` to export the newly created LifeCycleObserver
  class.

The generated class looks like:

```ts
import {
  /* inject, Application, CoreBindings, */
  lifeCycleObserver, // The decorator
  CoreTags,
  LifeCycleObserver, // The interface
} from '@loopback/core';

/**
 * This class will be bound to the application as a `LifeCycleObserver` during
 * `boot`
 */
@lifeCycleObserver('observer-group-name')
export class HelloObserver implements LifeCycleObserver {
  /*
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) private app: Application,
  ) {}
  */

  /**
   * This method will be invoked when the application initializes. It will be
   * called at most once for a given application instance.
   */
  async init(): Promise<void> {
    // Add your logic for init
  }

  /**
   * This method will be invoked when the application starts.
   */
  async start(): Promise<void> {
    // Add your logic for start
  }

  /**
   * This method will be invoked when the application stops.
   */
  async stop(): Promise<void> {
    // Add your logic for start
  }
}
```
