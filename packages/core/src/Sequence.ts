// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from './Application';
import {SwaggerRouter} from './router/SwaggerRouter';
import {responseWriter} from './response-writer';

const debug = require('debug')('loopback:Server');
import {ServerRequest as Request, ServerResponse as Response} from 'http';

export class Sequence {
  private router: SwaggerRouter;

  constructor(
    // should we inject server? only used to mount controllers ATM
    // (not needed if application does it up front, may need it to refresh
    // controller bindings or ensure controller fetches are dynamic)
    private app: Application,
    // TODO(superkhau) Inject send invoke reject, maybe router or default Swagger
  ) {
    // TODO(bajtos) support hot-reloading of controllers
    // after the app started. The idea is to rebuild the SwaggerRouter
    // instance whenever a controller was added/deleted.
    this.router = new SwaggerRouter();
  }

  async run(req: Request, res: Response) {
    // request parser -- decomposed from router, sets parsed http request into the app context

    // this code will probably disappear when the router is decomposed
    // the controllers are mounted when they are needed during the run sequence
    const apps = this.app.find('applications.*');
    for (const appBinding of apps) {
      debug('Registering app controllers for %j', appBinding.key);
      const app = await Promise.resolve(appBinding.getValue(this.app)) as Application;
      app.mountControllers(this.router);
    }

    // TODO(superkhau) Turn req/res into a Message
    // const msg: Message = await this.invoke(); // decomposed invoke
    // this.send(msg);
    this.send(req, res);
  }

  // decomposed response writer
  send(req: Request, res: Response) { // msg: Message
    // get response writer
    this.router.handler(req, res, () => {
      console.log('done');
    });
    // responseWriter(msg);
  }
}
