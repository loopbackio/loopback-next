// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ServerRequest as Request, ServerResponse as Response} from 'http';
import * as bluebird from 'bluebird';

type HandlerCallback = (err?: Error | string) => void;
type RequestHandler = (req: Request, res: Response, cb?: HandlerCallback) => void;

export type Controller = new (...args: any[]) => Object;

/**
 * SwaggerRouter - an express-compatible Router using OpenAPI/Swagger
 * to define routes and input parameters
 */
export default class SwaggerRouter {
  /**
   * The function handling incoming requests.
   * Pass it Node.js HttpServer or register it
   * as Express.js middleware.
   *
   * @param req {http.ServerRequest} The incoming request.
   * @param res {http.ServerResponse} The response object.
   * @param [cb] {Function} The callback to call when handling failed with an error,
   * or when there is no endpoint registered to handle the request URL.
   */
  public readonly handler: RequestHandler;

  constructor() {
    // NOTE(bajtos) It is important to use an arrow function here to allow
    // users to pass "router.handler" around as a regular function,
    // e.g. http.createServer(router.handler)
    this.handler = (req: Request, res: Response, callback: HandlerCallback) => {
      this._handleRequest(req, res, (err: any) => {
        if (callback) callback(err);
        else this._finalHandler(req, res, err);
      });
    };
  }

  /**
   * Register a controller. The controller should be
   * a regular ES6/TS class, use @api decorator to describe
   * the REST API implemented by the controller.
   * TODO(bajtos) How to support ES6 where decorators are not available?
   *
   * @param controllerCtor {Controller} Controller's constructor.
   */
  public controller(controllerCtor: Controller): void {
    // A stupid dummy stub implementation that always
    // call the first prototype function.
    // Will be replaced later with a real implementation.
    // I am following TDD here and don't yet have a test that
    // would require a better implementation beyond this
    // simple stub
    const handler = async (req: Request, res: Response) => {
      const methodName = Object.keys(controllerCtor.prototype)[0];
      const result = await new controllerCtor()[methodName]();
      res.write(result);
      res.end();
    };
    this._handleRequest = (req, res, next) => handler(req, res).catch(next);
  }

  private _handleRequest(request: Request, response: Response, next: HandlerCallback): void {
    response.write('hello');
    response.end();
  }

  private _finalHandler(req: Request, res: Response, err?: any) {
    // TODO(bajtos) cover this final handler by tests
    if (err) {
      res.statusCode = err.statusCode || err.status || 500;
      res.end();
    } else {
      res.statusCode = 404;
      res.write(req.url + ' not found.\n');
      res.end();
    }
  }
}
