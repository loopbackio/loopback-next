// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Booter} from '@loopback/booter';
import {
  Application,
  Binding,
  Component,
  Constructor,
  CoreBindings,
  createBindingFromClass,
  inject,
} from '@loopback/core';
import {
  ApplicationMetadataBooter,
  ControllerBooter,
  InterceptorProviderBooter,
  LifeCycleObserverBooter,
  ServiceBooter,
} from './booters';
import {Bootstrapper} from './bootstrapper';

/**
 * BootstrapComponent is used to export the default list of Booter's made
 * available by this module as well as bind the BootStrapper to the app so it
 * can be used to run the Booters.
 */
export class BootComponent implements Component {
  bindings: Binding[] = [createBindingFromClass(Bootstrapper)];
  // Export a list of default booters in the component so they get bound
  // automatically when this component is mounted.
  booters: Constructor<Booter>[];

  /**
   *
   * @param app - Application instance
   */
  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) app: Application) {
    this.booters = [
      ApplicationMetadataBooter,
      ControllerBooter,
      ServiceBooter,
      LifeCycleObserverBooter,
      InterceptorProviderBooter,
    ];
  }
}
