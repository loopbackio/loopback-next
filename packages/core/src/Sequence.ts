// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from './application';
import {Server} from './server';
import {SwaggerRouter} from './router/SwaggerRouter';

const debug = require('debug')('loopback:Server');
import {ServerRequest, ServerResponse} from 'http';

export class Sequence {
  async run(server: Server, req: ServerRequest, res: ServerResponse) {
    // TODO(bajtos) support hot-reloading of controllers
    // after the app started. The idea is to rebuild the SwaggerRouter
    // instance whenever a controller was added/deleted.
    const router = new SwaggerRouter();

    const apps = server.find('applications.*');
    for (const appBinding of apps) {
      debug('Registering app controllers for %j', appBinding.key);
      const app = await Promise.resolve(appBinding.getValue(server)) as Application;
      app.mountControllers(router);
    }

    router.handler(req, res, () => {
      console.log('done');
    });
  }
}
