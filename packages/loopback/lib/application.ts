// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

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
}
