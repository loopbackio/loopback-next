// Copyright IBM Corp. 2017,2020. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/context';
import {
  Application,
  ApplicationConfig,
  ApplicationMetadata,
  ControllerClass,
} from './application';
import {
  LifeCycleObserverOptions,
  LifeCycleObserverRegistry,
} from './lifecycle-registry';

/**
 * Namespace for core binding keys
 */
export namespace CoreBindings {
  // application
  /**
   * Binding key for application instance itself
   */
  export const APPLICATION_INSTANCE = BindingKey.create<Application>(
    'application.instance',
  );

  /**
   * Binding key for application configuration
   */
  export const APPLICATION_CONFIG: BindingKey<ApplicationConfig> =
    BindingKey.create<ApplicationConfig>('application.config');

  /**
   * Binding key for the content of `package.json`
   */
  export const APPLICATION_METADATA = BindingKey.create<ApplicationMetadata>(
    'application.metadata',
  );

  // server
  /**
   * Binding key for servers
   */
  export const SERVERS = 'servers';

  // component
  /**
   * Binding key for components
   */
  export const COMPONENTS = 'components';

  // controller
  export const CONTROLLERS = 'controllers';

  /**
   * Binding key for the controller class resolved in the current request
   * context
   */
  export const CONTROLLER_CLASS: BindingKey<ControllerClass> =
    BindingKey.create<ControllerClass>('controller.current.ctor');

  /**
   * Binding key for the controller method resolved in the current request
   * context
   */
  export const CONTROLLER_METHOD_NAME = BindingKey.create<string>(
    'controller.current.operation',
  );

  /**
   * Binding key for the controller method metadata resolved in the current
   * request context
   */
  export const CONTROLLER_METHOD_META = 'controller.method.meta';

  /**
   * Binding key for the controller instance resolved in the current request
   * context
   */
  export const CONTROLLER_CURRENT = BindingKey.create('controller.current');

  export const LIFE_CYCLE_OBSERVERS = 'lifeCycleObservers';
  /**
   * Binding key for life cycle observer options
   */
  export const LIFE_CYCLE_OBSERVER_REGISTRY =
    BindingKey.create<LifeCycleObserverRegistry>('lifeCycleObserver.registry');

  /**
   * Binding key for life cycle observer options
   */
  export const LIFE_CYCLE_OBSERVER_OPTIONS =
    BindingKey.create<LifeCycleObserverOptions>('lifeCycleObserver.options');
}

export namespace CoreTags {
  /**
   * Binding tag for components
   */
  export const COMPONENT = 'component';

  /**
   * Binding tag for servers
   */
  export const SERVER = 'server';

  /**
   * Binding tag for controllers
   */
  export const CONTROLLER = 'controller';

  /**
   * Binding tag for services
   */
  export const SERVICE = 'service';
  /**
   * Binding tag for the service interface
   */
  export const SERVICE_INTERFACE = 'serviceInterface';

  /**
   * Binding tag for life cycle observers
   */
  export const LIFE_CYCLE_OBSERVER = 'lifeCycleObserver';

  /**
   * Binding tag for group name of life cycle observers
   */
  export const LIFE_CYCLE_OBSERVER_GROUP = 'lifeCycleObserverGroup';

  /**
   * Binding tag for extensions to specify name of the extension point that an
   * extension contributes to.
   */
  export const EXTENSION_FOR = 'extensionFor';

  /**
   * Binding tag for an extension point to specify name of the extension point
   */
  export const EXTENSION_POINT = 'extensionPoint';
}
