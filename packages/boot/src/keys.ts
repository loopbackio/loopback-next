// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BooterBindings, BooterTags} from '@loopback/booter';
import {BindingKey} from '@loopback/core';
import {Bootstrapper} from './bootstrapper';
import {BootOptions} from './types';

/**
 * Namespace for boot related binding keys
 */
export namespace BootBindings {
  /**
   * Binding key for binding the BootStrapper class
   */
  export const BOOTSTRAPPER_KEY = BindingKey.create<Bootstrapper>(
    BooterBindings.BOOTSTRAPPER_KEY.toString(),
  );
  /**
   * Binding key for boot options
   */
  export const BOOT_OPTIONS = BindingKey.create<BootOptions>(
    BooterBindings.BOOT_OPTIONS.toString(),
  );
  /**
   * Binding key for determining project root directory
   */
  export const PROJECT_ROOT = BooterBindings.PROJECT_ROOT;

  /**
   * Booter binding namespace
   */
  export const BOOTERS = BooterBindings.BOOTERS;
  export const BOOTER_PREFIX = BooterBindings.BOOTERS;
}

/**
 * Namespace for boot related tags
 */
export namespace BootTags {
  export const BOOTER = BooterTags.BOOTER;
  /**
   * @deprecated Use `BootTags.BOOTER` instead.
   */
  export const BOOTER_TAG = BootTags.BOOTER;
}
