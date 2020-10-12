// IMPORTANT
// This snapshot file is auto-generated, but designed for humans.
// It should be checked into source control and tracked carefully.
// Re-generate by setting UPDATE_SNAPSHOTS=1 and running tests.
// Make sure to inspect the changes in the snapshots below.
// Do not ignore changes!

'use strict';

exports[`lb4 observer valid generation of observers generates a basic observer from CLI with group 1`] = `
import {
  /* inject, Application, CoreBindings, */
  lifeCycleObserver, // The decorator
  LifeCycleObserver, // The interface
} from '@loopback/core';

/**
 * This class will be bound to the application as a \`LifeCycleObserver\` during
 * \`boot\`
 */
@lifeCycleObserver('myGroup')
export class MyObserverObserver implements LifeCycleObserver {
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
    // Add your logic for stop
  }
}

`;


exports[`lb4 observer valid generation of observers generates a basic observer from CLI with group 2`] = `
export * from './my-observer.observer';

`;


exports[`lb4 observer valid generation of observers generates a basic observer from command line arguments 1`] = `
import {
  /* inject, Application, CoreBindings, */
  lifeCycleObserver, // The decorator
  LifeCycleObserver, // The interface
} from '@loopback/core';

/**
 * This class will be bound to the application as a \`LifeCycleObserver\` during
 * \`boot\`
 */
@lifeCycleObserver('')
export class MyObserverObserver implements LifeCycleObserver {
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
    // Add your logic for stop
  }
}

`;


exports[`lb4 observer valid generation of observers generates a basic observer from command line arguments 2`] = `
export * from './my-observer.observer';

`;


exports[`lb4 observer valid generation of observers generates a observer from a config file 1`] = `
import {
  /* inject, Application, CoreBindings, */
  lifeCycleObserver, // The decorator
  LifeCycleObserver, // The interface
} from '@loopback/core';

/**
 * This class will be bound to the application as a \`LifeCycleObserver\` during
 * \`boot\`
 */
@lifeCycleObserver('')
export class MyObserverObserver implements LifeCycleObserver {
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
    // Add your logic for stop
  }
}

`;


exports[`lb4 observer valid generation of observers generates a observer from a config file 2`] = `
export * from './my-observer.observer';

`;
