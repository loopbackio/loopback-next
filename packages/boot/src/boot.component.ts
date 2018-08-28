// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Bootstrapper} from './bootstrapper';
import {Component, Application, CoreBindings} from '@loopback/core';
import {inject, BindingScope} from '@loopback/context';
import {
  ControllerBooter,
  RepositoryBooter,
  DataSourceBooter,
  ServiceBooter,
} from './booters';
import {BootBindings} from './keys';

/**
 * BootComponent is used to export the default list of Booter's made
 * available by this module as well as bind the BootStrapper to the app so it
 * can be used to run the Booters.
 */
export class BootComponent implements Component {
  // Export a list of default booters in the component so they get bound
  // automatically when this component is mounted.
  booters = [
    ControllerBooter,
    RepositoryBooter,
    ServiceBooter,
    DataSourceBooter,
  ];

  /**
   *
   * @param app Application instance
   */
  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) app: Application) {
    // Bound as a SINGLETON so it can be cached as it has no state
    app
      .bind(BootBindings.BOOTSTRAPPER_KEY)
      .toClass(Bootstrapper)
      .inScope(BindingScope.SINGLETON);
  }
}
