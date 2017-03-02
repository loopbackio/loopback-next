// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Binding} from './context/binding';
import {Context} from './context';
import * as http from 'http';
import SwaggerRouter from './router/SwaggerRouter';
import {getApiSpec} from './router/metadata';

const debug = require('debug')('loopback:Application');

export class Application extends Context {
  public mountControllers(router: SwaggerRouter) {
    this.find('controllers.*').forEach(b => {
      debug('mounting controller %j', b.key);
      const ctor = b.getValue();
      const ctorFactory = (req: http.ServerRequest, res: http.ServerResponse) => {
        // TODO(bajtos) Create per-request Context, inject Controller constructor parameters
        return new ctor();
      };
      const apiSpec = getApiSpec(ctor);
      router.controller(ctorFactory, apiSpec);
    });
  }

  /**
   * Register a controller class with this application.
   *
   * @param controllerCtor {Function} The controller class (constructor function).
   * @return {Binding} The newly created binding, you can use the reference to further
   * modify the binding, e.g. lock the value to prevent further modifications.
   *
   * ```ts
   * @spec(apiSpec)
   * class MyController {
   * }
   * app.controller(MyController).lock();
   * ```
   */
  public controller(controllerCtor: new(...args: any[]) => Object): Binding {
    return this.bind('controllers.' + controllerCtor.name).to(controllerCtor);
  }
}
