// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/booter
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

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
