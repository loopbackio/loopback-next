// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  Binding,
  BindingFilter,
  BindingScope,
  config,
  Constructor,
  Context,
  ContextView,
  CoreBindings,
  CoreTags,
  createBindingFromClass,
  inject,
  MetadataInspector,
} from '@loopback/core';
import {HttpServer, HttpServerOptions} from '@loopback/http-server';
import cors from 'cors';
import debugFactory from 'debug';
import {cloneDeep} from 'lodash';
import SocketIO, {Server, ServerOptions, Socket} from 'socket.io';
import {
  getSocketIoMetadata,
  SocketIoMetadata,
  SOCKET_IO_CONNECT_METADATA,
  SOCKET_IO_METADATA,
  SOCKET_IO_SUBSCRIBE_METADATA,
} from './decorators';
import {SocketIoBindings, SocketIoTags} from './keys';
import {SocketIoControllerFactory} from './socketio-controller-factory';
const debug = debugFactory('loopback:socketio:server');

export type SockIOMiddleware = (
  socket: Socket,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (err?: any) => void,
) => void;

export const getNamespaceKeyForName = (name: string) =>
  `socketio.namespace.${name}`;

/**
 * A binding filter to match socket.io controllers
 * @param binding - Binding object
 */
export const socketIoControllers: BindingFilter = binding => {
  // It has to be tagged with `controller`
  if (!binding.tagNames.includes(CoreTags.CONTROLLER)) return false;
  // It can be explicitly tagged with `socket.io`
  if (binding.tagNames.includes(SocketIoTags.SOCKET_IO)) return true;

  // Now inspect socket.io decorations
  if (binding.valueConstructor) {
    const cls = binding.valueConstructor;
    const classMeta = MetadataInspector.getClassMetadata(
      SOCKET_IO_METADATA,
      cls,
    );
    if (classMeta != null) {
      debug('SocketIo metadata found at class %s', cls.name);
      return true;
    }
    const subscribeMeta = MetadataInspector.getAllMethodMetadata(
      SOCKET_IO_SUBSCRIBE_METADATA,
      cls.prototype,
    );
    if (subscribeMeta != null) {
      debug('SocketIo subscribe metadata found at methods of %s', cls.name);
      return true;
    }

    const connectMeta = MetadataInspector.getAllMethodMetadata(
      SOCKET_IO_CONNECT_METADATA,
      cls.prototype,
    );
    if (connectMeta != null) {
      debug('SocketIo connect metadata found at methods of %s', cls.name);
      return true;
    }
  }
  return false;
};

// Server config expected from application
export interface SocketIoServerOptions {
  httpServerOptions?: HttpServerResolvedOptions;
  socketIoOptions?: ServerOptions;
}

/**
 * A socketio server
 */
export class SocketIoServer extends Context {
  private controllers: ContextView;
  private httpServer: HttpServer;
  private readonly io: Server;
  public readonly config: HttpServerResolvedOptions;

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) public app: Application,
    @config({fromBinding: CoreBindings.APPLICATION_INSTANCE})
    protected options: SocketIoServerOptions = {},
  ) {
    super(app);
    if (!options.socketIoOptions) {
      this.io = SocketIO();
    } else {
      this.io = SocketIO(options.socketIoOptions);
    }
    app.bind(SocketIoBindings.IO).to(this.io);

    this.controllers = this.createView(socketIoControllers);
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
   * @param meta
   */
  route(
    controllerClass: Constructor<object>,
    meta?: SocketIoMetadata | string | RegExp,
  ) {
    if (meta instanceof RegExp || typeof meta === 'string') {
      meta = {namespace: meta} as SocketIoMetadata;
    }
    if (meta == null) {
      meta = getSocketIoMetadata(controllerClass) as SocketIoMetadata;
    }
    const nsp = meta?.namespace ? this.io.of(meta.namespace) : this.io;
    if (meta?.name) {
      this.app.bind(getNamespaceKeyForName(meta.name)).to(nsp);
    }

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
        'SocketIo connected: id=%s namespace=%s',
        socket.id,
        socket.nsp.name,
      );
      try {
        await new SocketIoControllerFactory(
          this,
          controllerClass,
          socket,
        ).create();
      } catch (err) {
        debug(
          'SocketIo error: error creating controller instance con connection',
          err,
        );
      }
    };
  }

  /**
   * Register a socket.io controller
   * @param controllerClass
   */
  controller(controllerClass: Constructor<unknown>): Binding<unknown> {
    debug('Adding controller %s', controllerClass.name);
    const binding = createBindingFromClass(controllerClass, {
      namespace: SocketIoBindings.CONTROLLERS_NAMESPACE,
      defaultScope: BindingScope.TRANSIENT,
    }).tag(SocketIoTags.SOCKET_IO, CoreTags.CONTROLLER);
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
    const requestListener = this.getSync(SocketIoBindings.REQUEST_LISTENER);
    const serverOptions = resolveHttpServerConfig(
      this.options.httpServerOptions,
    );
    this.httpServer = new HttpServer(requestListener, serverOptions);
    await this.httpServer.start();
    this.io.attach(this.httpServer.server, this.options.socketIoOptions);
  }

  /**
   * Stop the socketio server
   */
  async stop() {
    const closePromise = new Promise<void>((resolve, _reject) => {
      this.io.close(() => {
        resolve();
      });
    });
    await closePromise;
    if (this.httpServer) await this.httpServer.stop();
  }
}

/**
 * Valid configuration for the HttpServer constructor.
 */

export interface HttpServerResolvedOptions {
  host?: string;
  port: number;
  path?: string;
  basePath?: string;
  cors: cors.CorsOptions;
}

const DEFAULT_CONFIG: HttpServerResolvedOptions & HttpServerOptions = {
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

function resolveHttpServerConfig(
  applicationConfig?: HttpServerResolvedOptions,
): HttpServerResolvedOptions {
  const result: HttpServerResolvedOptions = Object.assign(
    cloneDeep(DEFAULT_CONFIG),
    applicationConfig,
  );

  // Can't check falsiness, 0 is a valid port.
  if (result.port == null) {
    result.port = 3000;
  }

  if (result.host == null) {
    // Set it to '' so that the http server will listen on all interfaces
    result.host = undefined;
  }

  return result;
}
