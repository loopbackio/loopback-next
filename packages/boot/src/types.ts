// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ArtifactOptions, Booter} from '@loopback/booter';
import {Binding, Constructor} from '@loopback/core';

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
 * Interface to describe an object that may have an array of `booters`.
 */
export interface InstanceWithBooters {
  booters?: Constructor<Booter>[];
}
