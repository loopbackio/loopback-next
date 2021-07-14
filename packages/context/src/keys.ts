// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ConfigurationResolver} from './binding-config';
import {BindingKey} from './binding-key';

/**
 * Namespace for context tags
 */
export namespace ContextTags {
  export const CLASS = 'class';
  export const PROVIDER = 'provider';
  export const DYNAMIC_VALUE_PROVIDER = 'dynamicValueProvider';

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
   * Binding tag to associate a configuration binding with the target binding key
   */
  export const CONFIGURATION_FOR = 'configurationFor';

  /**
   * Binding tag for global interceptors
   */
  export const GLOBAL_INTERCEPTOR = 'globalInterceptor';

  /**
   * Binding tag for global interceptors to specify sources of invocations that
   * the interceptor should apply. The tag value can be a string or string[], such
   * as `'route'` or `['route', 'proxy']`.
   */
  export const GLOBAL_INTERCEPTOR_SOURCE = 'globalInterceptorSource';

  /**
   * Binding tag for group name of global interceptors
   */
  export const GLOBAL_INTERCEPTOR_GROUP = 'globalInterceptorGroup';
}

/**
 * Default namespace for global interceptors
 */
export const GLOBAL_INTERCEPTOR_NAMESPACE = 'globalInterceptors';

/**
 * Default namespace for local interceptors
 */
export const LOCAL_INTERCEPTOR_NAMESPACE = 'interceptors';

/**
 * Namespace for context bindings
 */
export namespace ContextBindings {
  /**
   * Binding key for ConfigurationResolver
   */
  export const CONFIGURATION_RESOLVER =
    BindingKey.create<ConfigurationResolver>(
      `${BindingKey.CONFIG_NAMESPACE}.resolver`,
    );

  /**
   * Binding key for ordered groups of global interceptors
   */
  export const GLOBAL_INTERCEPTOR_ORDERED_GROUPS = BindingKey.create<string[]>(
    'globalInterceptor.orderedGroups',
  );
}
