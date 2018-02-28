// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Constructor, Binding} from '@loopback/context';

/**
 * Type definition for ArtifactOptions. These are the options supported by
 * this Booter.
 *
 * @param dirs String / String Array of directories to check for artifacts.
 * Paths must be relative. Defaults to ['controllers']
 * @param extensions String / String Array of file extensions to match artifact
 * files in dirs. Defaults to ['.controller.js']
 * @param nested Boolean to control if artifact discovery should check nested
 * folders or not. Default to true
 * @param glob  Optional. A `glob` string to use when searching for files. This takes
 * precendence over other options.
 */
export type ArtifactOptions = {
  dirs?: string | string[];
  extensions?: string | string[];
  nested?: boolean;
  glob?: string;
};

/**
 * Defines the requirements to implement a Booter for LoopBack applications:
 * configure() : Promise<void>
 * discover() : Promise<void>
 * load(): Promise<void>
 *
 * A Booter will run through the above methods in order.
 *
 * @export
 * @interface Booter
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
 * Type Object for Options passed into .boot()
 *
 * @property projectRoot Root of project. All other artifacts are resolved relative to this
 * @property booters An array of booters to bind to the application before running bootstrapper
 * @property filter.booters An array of booters that should be run by the bootstrapper
 * @property filter.phases An array of phases that should be run
 */
export type BootOptions = {
  controllers?: ArtifactOptions;
  repositories?: ArtifactOptions;
  /**
   * Additional Properties
   */
  // tslint:disable-next-line:no-any
  [prop: string]: any;
};

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
  // tslint:disable-next-line:no-any
  [prop: string]: any;
};

/**
 * Interface to describe the additions made available to an Application
 * that uses BootMixin.
 */
export interface Bootable {
  projectRoot: string;
  bootOptions?: BootOptions;
  boot(): Promise<void>;
  booters(...booterCls: Constructor<Booter>[]): Binding[];
}
