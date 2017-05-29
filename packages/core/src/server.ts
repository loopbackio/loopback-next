// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from './application';
import {OperationRetval} from './invoke';
import {Sequence, FindRoute, InvokeMethod} from './Sequence';
import {RoutingTable, ResolvedRoute, ParsedRequest, parseRequestUrl} from './router/routing-table';
import {OperationArgs} from './parser';

import {Context} from '@loopback/context';

const debug = require('debug')('loopback:core:server');

import {createServer, ServerRequest, ServerResponse} from 'http';

import * as HttpErrors from 'http-errors';

export class Server extends Context {
  public state: ServerState;
  protected routingTable: RoutingTable<string>;
  public handler: (req: ServerRequest, res: ServerResponse) => void;
  protected _findRoute: FindRoute;
  protected _invoke: InvokeMethod;

  constructor(public app: Application, public config: ServerConfig = {port: 3000}) {
    super();
    this.state = ServerState.cold;

    // NOTE(bajtos) It is important to use an arrow function here to allow
    // users to pass "router.handler" around as a regular function,
    // e.g. http.createServer(router.handler)
    // TODO(bajtos) Move this function to Application
    this.handler = (req: ServerRequest, res: ServerResponse) => {
      // tslint:disable-next-line:no-floating-promises
      this._handleRequest(req, res).catch((err: Error) => {
        if (!res.headersSent) {
          res.statusCode = 500;
          res.end();
        }
        // It's the responsibility of the Sequence to handle any errors.
        // If an unhandled error escaped, then something very wrong happened
        // and it's best to crash the process immediately.
        process.nextTick(() => { throw err; });
      });
    };
  }

  async start() {
    this.state = ServerState.starting;

    // TODO(bajtos) support hot-reloading of controllers
    // after the app started. The idea is to rebuild the SwaggerRouter
    // instance whenever a controller was added/deleted.
    this.buildRoutes();

    const server = createServer(this.handler);
    server.listen(this.config.port);

    // FIXME(bajtos) The updated port number should be part of "status" object,
    // we shouldn't be changing original config IMO.
    // Consider exposing full base URL including http/https scheme prefix
    this.config.port = server.address().port;

    await new Promise(resolve => server.once('listening', resolve));
    this.state = ServerState.listening;
  }

  protected buildRoutes() {
    this.routingTable = new RoutingTable<string>();

    const controllers = this.app.getAllControllers();
    for (const c of controllers) {
      this.routingTable.registerController(c.controller, c.spec);
    }
  }

  protected _handleRequest(request: ServerRequest, response: ServerResponse) {
    const parsedRequest: ParsedRequest = parseRequestUrl(request);
    const requestContext = this.app.createRequestContext(request, response);

    const findRoute: FindRoute = (req) => {
      const found = this.routingTable.find(req);
      if (!found) {
        throw new HttpErrors.NotFound(
          `Endpoint "${req.method} ${req.path}" not found.`);
      }
      this.app.bindRouteInfo(requestContext, found.controller, found.methodName);
      return found;
    };

    const invoke: InvokeMethod = async (controllerName, method, args) => {
      const controller: { [opName: string]: Function } = await requestContext.get(controllerName);
      const result = await controller[method](...args);
      return result;
    };

    const sequence = new Sequence(findRoute, invoke);
    return sequence.run(this, parsedRequest, response);
  }
}

export interface ServerConfig {
  port: number;
}

export enum ServerState {
  cold,
  starting,
  listening,
  crashed,
  stopped,
}
