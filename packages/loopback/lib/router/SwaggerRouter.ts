// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ServerRequest as Request, ServerResponse as Response} from 'http';
import {OpenApiSpec, OperationObject, ParameterObject} from './OpenApiSpec';
import * as assert from 'assert';
import * as url from 'url';
import * as pathToRegexp from 'path-to-regexp';
const debug = require('debug')('loopback:SwaggerRouter');

type HandlerCallback = (err?: Error | string) => void;
type RequestHandler = (req: Request, res: Response, cb?: HandlerCallback) => void;

export type ControllerFactory = (request: Request, response: Response) => Object;

/**
 * SwaggerRouter - an express-compatible Router using OpenAPI/Swagger
 * to define routes and input parameters
 */
export class SwaggerRouter {
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

  private readonly _endpoints: Endpoint[] = [];

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
   * @param controllerCtor {ControllerFactory} A factory function accepting (Request, Response) arguments
   * and returning the Controller instance to use.
   * @param spec {OpenApiSpec} The Swagger specification describing the methods provided by this controller.
   */
  public controller(factory: ControllerFactory, spec: OpenApiSpec): void {
    assert(typeof factory === 'function', 'Controller factory must be a function.');
    assert(typeof spec === 'object' && !!spec, 'API speciification must be a non-null object');
    if (!spec.paths || !Object.keys(spec.paths).length) {
      return;
    }

    debug('Registering Controller with API', spec);

    for (const path in spec.paths) {
      for (const verb in spec.paths[path]) {
        const opSpec = spec.paths[path][verb];
        debug('  %s %s -> %s(%s)', verb, path, opSpec['x-operation-name'],
          (opSpec.parameters || []).map(p => p.name).join(', '));
        this._endpoints.push(new Endpoint(path, verb, opSpec, factory));
      }
    }
  }

  private _handleRequest(request: Request, response: Response, next: HandlerCallback): void {
    // TODO(bajtos) The following parsing can be skipped when the router
    // is mounted on an express app
    const parsedUrl = url.parse(request.url, true);
    const parsedRequest = request as ParsedRequest;
    parsedRequest.path = parsedUrl.pathname;
    parsedRequest.query = parsedUrl.query;

    debug('Handle request "%s %s"', request.method, parsedRequest.path);

    let endpointIx = 0;
    const tryNextEndpoint = (err?: Error): void => {
      if (err) {
        next(err);
      } else if (endpointIx >= this._endpoints.length) {
        next();
      } else {
        this._endpoints[endpointIx++].handle(parsedRequest, response, tryNextEndpoint);
      }
    };
    tryNextEndpoint();
  }

  private _finalHandler(req: Request, res: Response, err?: any) {
    // TODO(bajtos) cover this final handler by tests
    // TODO(bajtos) make the error-handling strategy configurable (e.g. via strong-error-handler)
    if (err) {
      res.statusCode = err.statusCode || err.status || 500;
      console.error('Unhandled error in %s %s: %s %s', req.method, req.url, res.statusCode, err.stack || err);
      res.end();
    } else {
      console.error('Not found: %s %s', req.method, req.url);
      res.statusCode = 404;
      res.write(req.url + ' not found.\n');
      res.end();
    }
  }
}

interface ParsedRequest extends Request {
  // see http://expressjs.com/en/4x/api.html#req.path
  path: string;
  // see http://expressjs.com/en/4x/api.html#req.query
  query: { [key: string]: string };
}

class Endpoint {
  private readonly _verb: string;
  private readonly _pathRegexp: pathToRegexp.PathRegExp;

  constructor(
      path: string,
      verb: string,
      private readonly _spec: OperationObject,
      private readonly _controllerFactory: ControllerFactory) {
    this._verb = verb.toLowerCase();

    // In Swagger, path parameters are wrapped in `{}`.
    // In Express.js, path parameters are prefixed with `:`
    path = path.replace(/{([^}]*)}(\/|$)/g, ':$1$2');
    this._pathRegexp = pathToRegexp(path, [], {strict: false, end: true});
  }

  public handle(request: ParsedRequest, response: Response, next: HandlerCallback) {
    debug('trying endpoint', this);
    if (this._verb !== request.method.toLocaleLowerCase()) {
      debug(' -> next (verb mismatch)');
      next();
      return;
    }

    const match = this._pathRegexp.exec(request.path);
    if (!match) {
      debug(' -> next (path mismatch)');
      next();
      return;
    }

    const pathParams = Object.create(null);
    for (const ix in this._pathRegexp.keys) {
      const key = this._pathRegexp.keys[ix];
      const matchIndex = +ix + 1;
      pathParams[key.name] = match[matchIndex];
    }

    const controller = this._controllerFactory(request, response);
    const operationName = this._spec['x-operation-name'];
    const args = buildOperationArguments(this._spec, request, pathParams);

    debug('invoke %s with arguments', operationName, args);

    // TODO(bajtos) support sync operations that return the value directly (no Promise)
    controller[operationName].apply(controller, args).then(
      function onSuccess(result) {
        debug('%s() result -', operationName, result);
        // TODO(bajtos) handle non-string results via JSON.stringify
        if (result) {
          // TODO(ritch) remove this, should be configurable
          response.setHeader('Content-Type', 'application/json');
          // TODO(bajtos) handle errors - JSON.stringify can throw
          if (typeof result === 'object')
            result = JSON.stringify(result);
          response.write(result);
        }
        response.end();
        // Do not call next(), the request was handled.
      },
      function onError(err) {
        debug('%s() failed - ', operationName, err.stack || err);
        next(err);
      });
  }
}

function buildOperationArguments(operationSpec: OperationObject, request: ParsedRequest,
    pathParams: {[key: string]: any}): any[] {
  const args = [];
  for (const paramSpec of operationSpec.parameters || []) {
    if ('$ref' in paramSpec) {
      // TODO(bajtos) implement $ref parameters
      throw new Error('$ref parameters are not supported yet.');
    }
    const spec = paramSpec as ParameterObject;
    switch (spec.in) {
      case 'query':
        args.push(request.query[spec.name]);
        break;
      case 'path':
        args.push(pathParams[spec.name]);
        break;
      default:
        // TODO(bajtos) support all parameter sources (path, body, etc.)
        throw new Error('Parameters with "in: ' + spec.in + '" are not supported yet.');
    }
  }
  return args;
}
