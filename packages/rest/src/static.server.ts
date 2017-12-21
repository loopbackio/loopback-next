// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const debug = require('debug')('loopback:rest:static-server');
import * as Http from 'http';
import {Binding, Context, Constructor, inject} from '@loopback/context';
import {Application, CoreBindings, Server} from '@loopback/core';
import {DefaultSequence, SequenceHandler, SequenceFunction} from './sequence';
import {RestBindings} from './keys';
import {
  FindRoute,
  InvokeMethod,
  Send,
  Reject,
  ParseParams,
  ParsedRequest,
} from './internal-types';
import {HttpHandler} from './http-handler';
import * as fs from 'fs';
import * as path from 'path';
import * as mime from 'mime';
const SequenceActions = RestBindings.SequenceActions;

export class StaticServer extends Context implements Server {
  /**
   * Handle incoming HTTP(S) request by invoking the corresponding
   * Controller method via the configured Sequence.
   *
   * @example
   *
   * ```ts
   * const app = new Application();
   * // setup controllers, etc.
   *
   * const server = http.createServer(app.handleHttp);
   * server.listen(3000);
   * ```
   *
   * @param req The request.
   * @param res The response.
   */
  public handleHttp: (
    req: Http.ServerRequest,
    res: Http.ServerResponse,
  ) => void;

  protected _httpHandler: HttpHandler;
  protected get httpHandler(): HttpHandler {
    this._setupHandlerIfNeeded();
    return this._httpHandler;
  }
  protected _httpServer: Http.Server;
  /**
   * @memberof RestServer
   * Creates an instance of RestServer.
   *
   * @param {Application} app The application instance (injected via
   * CoreBindings.APPLICATION_INSTANCE).
   * @param {RestServerConfig=} options The configuration options (injected via
   * RestBindings.CONFIG).
   *
   */
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) app: Application,
    @inject(RestBindings.CONFIG) options?: StaticServerConfig,
  ) {
    super(app);

    options = options || {};

    // Can't check falsiness, 0 is a valid port.
    if (options.port == null) {
      options.port = 4000;
    }
    if (options.host == null) {
      // Set it to '' so that the http server will listen on all interfaces
      options.host = undefined;
    }

    if (options.dir == null) {
      options.dir = path.parse('./src/public');
    }
    this.bind(RestBindings.PORT).to(options.port);
    this.bind(RestBindings.HOST).to(options.host);
    this.bind(RestBindings.DIR).to(options.dir);

    this.sequence(options.sequence ? options.sequence : DefaultSequence);

    this.handleHttp = (req: Http.ServerRequest, res: Http.ServerResponse) => {
      try {
        this._handleHttpRequest(req, res, options!).catch(err =>
          this._onUnhandledError(req, res, err),
        );
      } catch (err) {
        this._onUnhandledError(req, res, err);
      }
    };

    this.bind(RestBindings.HANDLER).toDynamicValue(() => this.httpHandler);
  }
  async start(): Promise<void> {
    const httpPort = await this.get(RestBindings.PORT);
    const httpHost = await this.get(RestBindings.HOST);
    this._httpServer = Http.createServer(this.handleHttp);
    const httpServer = this._httpServer;
    httpServer.listen(httpPort, httpHost);

    return new Promise<void>((resolve, reject) => {
      httpServer.once('listening', () => {
        this.bind(RestBindings.PORT).to(httpServer.address().port);
        resolve();
      });
      httpServer.once('error', reject);
    });
  }
  stop(): Promise<void> {
    // Kill the server instance.
    const server = this._httpServer;
    return new Promise<void>((resolve, reject) => {
      server.close((err: Error) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Configure a custom sequence class for handling incoming requests.
   *
   * ```ts
   * class MySequence implements SequenceHandler {
   *   constructor(
   *     @inject('send) public send: Send)) {
   *   }
   *
   *   public async handle(request: ParsedRequest, response: ServerResponse) {
   *     send(response, 'hello world');
   *   }
   * }
   * ```
   *
   * @param value The sequence to invoke for each incoming request.
   */
  public sequence(value: Constructor<SequenceHandler>) {
    this.bind(RestBindings.SEQUENCE).toClass(value);
  }

  protected _handleHttpRequest(
    request: Http.ServerRequest,
    response: Http.ServerResponse,
    options: StaticServerConfig,
  ) {
    // allow CORS support for all endpoints so that users
    // can test with online SwaggerUI instance
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Allow-Max-Age', '86400');

    return this.httpHandler.handleRequest(request, response);
  }

  public _onUnhandledError(
    req: Http.ServerRequest,
    res: Http.ServerResponse,
    err: Error,
  ) {
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end();
    }

    // It's the responsibility of the Sequence to handle any errors.
    // If an unhandled error escaped, then something very wrong happened
    // and it's best to crash the process immediately.
    process.nextTick(() => {
      throw err;
    });
  }

  protected _setupHandlerIfNeeded() {
    // TODO(bajtos) support hot-reloading of controllers
    // after the app started. The idea is to rebuild the HttpHandler
    // instance whenever a controller was added/deleted.
    // See https://github.com/strongloop/loopback-next/issues/433
    if (this._httpHandler) return;

    this._httpHandler = new HttpHandler(this);
    for (const b of this.find('controllers.*')) {
      const controllerName = b.key.replace(/^controllers\./, '');
      const ctor = b.valueConstructor;
      if (!ctor) {
        throw new Error(
          `The controller ${controllerName} was not bound via .toClass()`,
        );
      }
    }
    for (const b of this.find('routes.*')) {
      // TODO(bajtos) should we support routes defined asynchronously?
      const route = this.getSync(b.key);
      this._httpHandler.registerRoute(route);
    }
  }

  /**
   * Configure a custom sequence function for handling incoming requests.
   *
   * ```ts
   * app.handler((sequence, request, response) => {
   *   sequence.send(response, 'hello world');
   * });
   * ```
   *
   * @param handlerFn The handler to invoke for each incoming request.
   */
  public handler(handlerFn: SequenceFunction) {
    const _onUnhandledError = this._onUnhandledError;
    class SequenceFromFunction implements SequenceHandler {
      // NOTE(bajtos) Unfortunately, we have to duplicate the constructor
      // in order for our DI/IoC framework to inject constructor arguments
      constructor(
        @inject(RestBindings.Http.CONTEXT) public ctx: Context,
        @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
        @inject(SequenceActions.SEND) public send: Send,
        @inject(SequenceActions.REJECT) public reject: Reject,
      ) {}

      async handle(
        request: ParsedRequest,
        response: Http.ServerResponse,
      ): Promise<void> {
        if (request.method !== 'GET' || 'HEAD') {
          response.statusCode = 405;
          response.setHeader('Allow', 'GET, HEAD');
          response.setHeader('Content-Length', '0');
          response.end();
        }

        fs.exists(request.path, exists => {
          if (!exists) {
            response.statusCode = 404;
            response.setHeader('Content-Length', '0');
            response.end('File ${request.path} could not be found.');
          }

          fs.readFile(request.path, (err, data) => {
            if (err) {
              return _onUnhandledError(request, response, err);
            } else {
              const type = mime.getType(path.parse(request.path).ext);
              response.setHeader('content-type', type as string);
              response.statusCode = 200;
              if (request.method === 'GET') {
                response.end(data);
              } else {
                response.end();
              }
            }
          });
        });
      }
    }

    this.sequence(SequenceFromFunction);
  }
}

/**
 * Valid configuration for the RestServer constructor.
 *
 * @export
 * @interface StaticServerConfig
 */
export interface StaticServerConfig {
  host?: string;
  port?: number;
  dir?: path.FormatInputPathObject;
  sequence?: Constructor<SequenceHandler>;
}
