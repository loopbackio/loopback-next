// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Namespace for core binding keys
 */
export namespace BootBindings {
  /**
   * Binding key for Boot configuration
   */
  export const BOOT_OPTIONS = 'boot.options';
  export const PROJECT_ROOT = 'boot.project_root';

  // Key for Binding the BootStrapper Class
  export const BOOTSTRAPPER_KEY = 'application.bootstrapper';
  export const BOOTER_TAG = 'booter';
  export const BOOTER_PREFIX = 'booters';
}
