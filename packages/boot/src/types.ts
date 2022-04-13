// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Binding,
  BindingSpec,
  Constructor,
  ContextTags,
  injectable,
} from '@loopback/core';
import {BootBindings, BootTags} from './keys';

/**
 * Type definition for ArtifactOptions. These are the options supported by
 * this Booter.
 */
export type ArtifactOptions = {
  /**
   * Array of directories to check for artifacts.
   * Paths must be relative. Defaults to ['controllers']
   */
  dirs?: string | string[];
  /**
   * Array of file extensions to match artifact
   * files in dirs. Defaults to ['.controller.js']
   */
  extensions?: string | string[];
  /**
   * A flag to control if artifact discovery should check nested
   * folders or not. Default to true
   */
  nested?: boolean;
  /**
   * A `glob` string to use when searching for files. This takes
   * precedence over other options.
   */
  glob?: string;
};

/**
 * Defines the requirements to implement a Booter for LoopBack applications:
 * - configure()
 * - discover()
 * - load()
 *
 * A Booter will run through the above methods in order.
 */
export interface Booter {
  /**
   * Configure phase of the Booter. It should set options / defaults in this phase.
   */
  configure?(): Promise<void>;
  /**
   * Discover phase of the Booter. It should search for artifacts in this phase.
   */
  discover?(): Promise<void>;
  /**
   * Load phase of the Booter. It should bind the artifacts in this phase.
   */
  load?(): Promise<void>;
}

/**
 * Export of an array of all the Booter phases supported by the interface
 * above, in the order they should be run.
 */
export const BOOTER_PHASES = ['configure', 'discover', 'load'];

/**
 * Options to configure `Bootstrapper`
 */
export type BootOptions = {
  controllers?: ArtifactOptions;
  repositories?: ArtifactOptions;
  /**
   * Additional Properties
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;
};

/**
 * Options for boot() execution
 */
export type BootExecutionOptions = {
  /**
   * Optional array of Booter Classes to bind to the application before running bootstrapper.
   */
  booters?: Constructor<Booter>[];
  /**
   * Filter Object for Bootstrapper
   */
  filter?: {
    /**
     * Names of booters that should be run by Bootstrapper
     */
    booters?: string[];
    /**
     * Names of phases that should be run by Bootstrapper
     */
    phases?: string[];
  };
  /**
   * Additional Properties
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;
};

/**
 * Interface to describe the additions made available to an Application
 * that uses BootMixin.
 */
export interface Bootable {
  /**
   * Root directory for the project to be booted
   */
  projectRoot: string;
  /**
   * Options for boot
   */
  bootOptions?: BootOptions;
  /**
   * Boot up the project
   */
  boot(): Promise<void>;
  /**
   * Register booters
   * @param booterClasses - A list of booter classes
   */
  booters(...booterClasses: Constructor<Booter>[]): Binding[];
}

/**
 * `@booter` decorator to mark a class as a `Booter` and specify the artifact
 * namespace for the configuration of the booter
 *
 * @example
 * ```ts
 * @booter('controllers')
 * export class ControllerBooter extends BaseArtifactBooter {
 *   constructor(
 *     @inject(CoreBindings.APPLICATION_INSTANCE) public app: Application,
 *     @inject(BootBindings.PROJECT_ROOT) projectRoot: string,
 *     @config()
 *    public controllerConfig: ArtifactOptions = {},
 *   ) {
 *   // ...
 *   }
 * }
 * ```
 *
 * @param artifactNamespace - Namespace for the artifact. It will be used to
 * inject configuration from boot options. For example, the Booter class
 * decorated with `@booter('controllers')` can receive its configuration via
 * `@config()` from the `controllers` property of boot options.
 *
 * @param specs - Extra specs for the binding
 */
export function booter(artifactNamespace: string, ...specs: BindingSpec[]) {
  return injectable(
    {
      tags: {
        artifactNamespace,
        [BootTags.BOOTER]: BootTags.BOOTER,
        [ContextTags.NAMESPACE]: BootBindings.BOOTERS,
      },
    },
    ...specs,
  );
}

/**
 * Interface to describe an object that may have an array of `booters`.
 */
export interface InstanceWithBooters {
  booters?: Constructor<Booter>[];
}
