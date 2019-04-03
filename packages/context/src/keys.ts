// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from './binding-key';

/**
 * Namespace for context tags
 */
export namespace ContextTags {
  export const CLASS = 'class';
  export const PROVIDER = 'provider';

  /**
   * Type of the artifact
   */
  export const TYPE = 'type';
  /**
   * Namespace of the artifact
   */
  export const NAMESPACE = 'namespace';
  /**
   * Name of the artifact
   */
  export const NAME = 'name';
  /**
   * Binding key for the artifact
   */
  export const KEY = 'key';

  /**
   * Binding tag for global interceptors
   */
  export const GLOBAL_INTERCEPTOR = 'globalInterceptor';
  /**
   * Binding tag for group name of global interceptors
   */
  export const GLOBAL_INTERCEPTOR_GROUP = 'globalInterceptorGroup';
}

/**
 * Namespace for context bindings
 */
export namespace ContextBindings {
  /**
   * Binding key for ordered groups of global interceptors
   */
  export const GLOBAL_INTERCEPTOR_ORDERED_GROUPS = BindingKey.create<string[]>(
    'globalInterceptor.orderedGroups',
  );
}
