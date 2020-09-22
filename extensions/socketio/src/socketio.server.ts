// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  BindingFilter,
  BindingScope,
  Constructor,
  Context,
  ContextView,
  createBindingFromClass,
  inject,
  MetadataInspector,
} from '@loopback/context';
import {CoreBindings, CoreTags} from '@loopback/core';
import {HttpServer, HttpServerOptions} from '@loopback/http-server';
import debugFactory from 'debug';
import SocketIO, {Server, ServerOptions, Socket} from 'socket.io';
import {
  getSocketIOMetadata,
  SOCKET_IO_CONNECT_METADATA,
  SOCKET_IO_METADATA,
  SOCKET_IO_SUBSCRIBE_METADATA,
} from './decorators/socketio.decorator';
import {SocketIOBindings, SocketIOTags} from './keys';
import {SocketIOControllerFactory} from './socketio-controller-factory';

const debug = debugFactory('loopback:socketio:server');

export type SockIOMiddleware = (
  socket: Socket,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (err?: any) => void,
) => void;

/**
 * A binding filter to match socket.io controllers
 * @param binding - Binding object
 */
export const socketIOControllers: BindingFilter = binding => {
  // It has to be tagged with `controller`
  if (!binding.tagNames.includes(CoreTags.CONTROLLER)) return false;
  // It can be explicitly tagged with `socket.io`
  if (binding.tagNames.includes(SocketIOTags.SOCKET_IO)) return true;

  // Now inspect socket.io decorations
  if (binding.valueConstructor) {
    const cls = binding.valueConstructor;
    const classMeta = MetadataInspector.getClassMetadata(
      SOCKET_IO_METADATA,
      cls,
    );
    if (classMeta != null) {
      debug('SocketIO metadata found at class %s', cls.name);
      return true;
    }
    const subscribeMeta = MetadataInspector.getAllMethodMetadata(
      SOCKET_IO_SUBSCRIBE_METADATA,
      cls.prototype,
    );
    if (subscribeMeta != null) {
      debug('SocketIO subscribe metadata found at methods of %s', cls.name);
      return true;
    }

    const connectMeta = MetadataInspector.getAllMethodMetadata(
      SOCKET_IO_CONNECT_METADATA,
      cls.prototype,
    );
    if (connectMeta != null) {
      debug('SocketIO connect metadata found at methods of %s', cls.name);
      return true;
    }
  }
  return false;
};

export interface SocketIOServerOptions {
  httpServerOptions?: HttpServerOptions;
  socketIOOptions?: ServerOptions;
}

/**
 * A socketio server
 */
export class SocketIOServer extends Context {
  private controllers: ContextView;
  private httpServer: HttpServer;
  private io: Server;

  constructor(
    @inject(SocketIOBindings.CONFIG, {optional: true})
    private options: SocketIOServerOptions = {},
  ) {
    super();
    if (options.socketIOOptions == null) {
      this.io = SocketIO();
    } else {
      this.io = SocketIO(options.socketIOOptions);
    }
    this.controllers = this.createView(socketIOControllers);
  }

  get listening(): boolean {
    return this.httpServer ? this.httpServer.listening : false;
  }

  /**
   * Register a sock.io middleware function
   * @param fn
   */
  use(fn: SockIOMiddleware) {
    return this.io.use(fn);
  }

  get url() {
    return this.httpServer?.url;
  }

  /**
   * Register a socketio controller
   * @param controllerClass
   * @param namespace
   */
  route(controllerClass: Constructor<object>, namespace?: string | RegExp) {
    if (namespace == null) {
      const meta = getSocketIOMetadata(controllerClass);
      namespace = meta?.namespace;
    }

    const nsp = namespace ? this.io.of(namespace) : this.io;
    nsp.on('connection', socket =>
      this.createSocketHandler(controllerClass)(socket),
    );
    return nsp;
  }

  /**
   * Create socket handler from the controller class
   * @param controllerClass
   */
  private createSocketHandler(
    controllerClass: Constructor<object>,
  ): (socket: Socket) => void {
    return async socket => {
      debug(
        'Websocket connected: id=%s namespace=%s',
        socket.id,
        socket.nsp.name,
      );
      // Create a request context
      const reqCtx = new SocketIORequestContext(socket, this);
      // Bind socketio
      reqCtx.bind(SocketIOBindings.SOCKET).to(socket);
      reqCtx.bind(CoreBindings.CONTROLLER_CLASS).to(controllerClass);
      reqCtx
        .bind(CoreBindings.CONTROLLER_CURRENT)
        .toClass(controllerClass)
        .inScope(BindingScope.SINGLETON);
      // Instantiate the controller instance
      await new SocketIOControllerFactory(reqCtx, controllerClass).create();
    };
  }

  /**
   * Register a socket.io controller
   * @param controllerClass
   */
  controller(controllerClass: Constructor<unknown>) {
    debug('Adding controller %s', controllerClass.name);
    const binding = createBindingFromClass(controllerClass, {
      namespace: 'socketio.controllers',
      defaultScope: BindingScope.TRANSIENT,
    }).tag(SocketIOTags.SOCKET_IO, CoreTags.CONTROLLER);
    this.add(binding);
    debug('Controller binding: %j', binding);
    return binding;
  }

  /**
   * Discover all socket.io controllers and register routes
   */
  discoverAndRegister() {
    const bindings = this.controllers.bindings;
    for (const binding of bindings) {
      if (binding.valueConstructor) {
        debug(
          'Controller binding found: %s %s',
          binding.key,
          binding.valueConstructor.name,
        );
        this.route(binding.valueConstructor as Constructor<object>);
      }
    }
  }

  /**
   * Start the socketio server
   */
  async start() {
    const config = this.options?.httpServerOptions || {
      host: '::',
      port: 3000,

      cors: {
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
        maxAge: 86400,
        credentials: true,
      },
    };
    this.httpServer = new HttpServer(() => {}, config);
    await this.httpServer.start();

    const socketConfig: SocketIO.ServerOptions = this.options
      ?.socketIOOptions || {
      origins: '*:*',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handlePreflightRequest: (req, res: any) => {
        const headers = {
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        };
        res.writeHead(200, headers);
        res.end();
      },
    };
    this.io.attach(this.httpServer.server, socketConfig);
  }

  /**
   * Stop the socketio server
   */
  async stop() {
    const closePromise = new Promise<void>((resolve, reject) => {
      this.io.close(() => {
        resolve();
      });
    });
    await closePromise;
    if (this.httpServer) await this.httpServer.stop();
  }
}

/**
 * Request context for a socket.io request
 */
export class SocketIORequestContext extends Context {
  constructor(public readonly socket: Socket, parent: Context) {
    super(parent);
  }
}
