// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/booter
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/core';

/**
 * Namespace for boot related binding keys
 */
export namespace BooterBindings {
  /**
   * Binding key for binding the BootStrapper class
   */
  export const BOOTSTRAPPER_KEY = BindingKey.create<unknown>(
    'application.bootstrapper',
  );
  /**
   * Binding key for boot options
   */
  export const BOOT_OPTIONS = BindingKey.create(
    BindingKey.buildKeyForConfig<unknown>(BOOTSTRAPPER_KEY.key).toString(),
  );
  /**
   * Booter binding namespace
   */
  export const BOOTERS = 'booters';
  /**
   * Binding key for determining project root directory
   */
  export const PROJECT_ROOT = BindingKey.create<string>('boot.project_root');
}

/**
 * Namespace for boot related tags
 */
export namespace BooterTags {
  export const BOOTER = 'booter';
}
