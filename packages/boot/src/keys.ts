// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/context';
import {BootOptions} from './interfaces';
import {Bootstrapper} from './bootstrapper';

/**
 * Namespace for core binding keys
 */
export namespace BootBindings {
  /**
   * Binding key for Boot configuration
   */
  export const BOOT_OPTIONS = BindingKey.create<BootOptions>('boot.options');
  /**
   * Binding key for determining project root directory
   */
  export const PROJECT_ROOT = BindingKey.create<string>('boot.project_root');

  /**
   * Binding key for binding the BootStrapper class
   */
  export const BOOTSTRAPPER_KEY = BindingKey.create<Bootstrapper>(
    'application.bootstrapper',
  );

  export const BOOTER_TAG = 'booter';
  export const BOOTER_PREFIX = 'booters';
}
