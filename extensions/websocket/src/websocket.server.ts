import {
  Application,
  BindingFilter,
  BindingScope,
  Constructor,
  Context,
  ContextView,
  CoreBindings,
  CoreTags,
  createBindingFromClass,
  inject,
  MetadataInspector,
} from '@loopback/core';
import {HttpServer} from '@loopback/http-server';
import SocketIO, {Namespace, Server, ServerOptions, Socket} from 'socket.io';
import {
  getWebsocketMetadata,
  WebsocketMetadata,
  WEBSOCKET_CONNECT_METADATA,
  WEBSOCKET_METADATA,
  WEBSOCKET_SUBSCRIBE_METADATA,
} from './decorators';
import {WebsocketBindings, WebsocketTags} from './keys';
import {WebsocketOptions} from './types';
import {WebsocketControllerFactory} from './websocket-controller-factory';

const debug = require('debug')('loopback:websocket');

export type SockIOMiddleware = (
  socket: Socket,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (err?: any) => void,
) => void;

export const NAMESPACE_KEY_FORMAT = `ws.namespace.[META_NAME]`;

export const getNamespaceKeyForName = (name: string) =>
  NAMESPACE_KEY_FORMAT.split('[META_NAME]').join(name);

/**
 * A binding filter to match socket.io controllers
 * @param binding - Binding object
 */
export const controllersBindingFilter: BindingFilter = binding => {
  // It has to be tagged with `controller`
  if (!binding.tagNames.includes(CoreTags.CONTROLLER)) return false;
  // It can be explicitly tagged with `socket.io`
  if (binding.tagNames.includes(WebsocketTags.SOCKET_IO)) return true;

  // Now inspect socket.io decorations
  if (binding.valueConstructor) {
    const cls = binding.valueConstructor;
    const classMeta = MetadataInspector.getClassMetadata(
      WEBSOCKET_METADATA,
      cls,
    );
    if (classMeta != null) {
      debug('SocketIO metadata found at class %s', cls.name);
      return true;
    }
    const subscribeMeta = MetadataInspector.getAllMethodMetadata(
      WEBSOCKET_SUBSCRIBE_METADATA,
      cls.prototype,
    );
    if (subscribeMeta != null) {
      debug('SocketIO subscribe metadata found at methods of %s', cls.name);
      return true;
    }

    const connectMeta = MetadataInspector.getAllMethodMetadata(
      WEBSOCKET_CONNECT_METADATA,
      cls.prototype,
    );
    if (connectMeta != null) {
      debug('SocketIO connect metadata found at methods of %s', cls.name);
      return true;
    }
  }
  return false;
};

export class WebsocketServer extends Context {
  private controllers: ContextView;
  protected io: Server;
  protected _httpServer: HttpServer;

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) public app: Application,
    @inject(WebsocketBindings.CONFIG, {optional: true})
    protected config: WebsocketOptions = {},
    @inject(WebsocketBindings.OPTIONS, {optional: true})
    protected options: ServerOptions = {},
  ) {
    super(app);
    this.io = SocketIO(options);
    this.controllers = this.createView(controllersBindingFilter);
    app.bind(WebsocketBindings.IO).to(this.io);
  }

  get url() {
    return this._httpServer?.url;
  }

  /**
   * Register a sock.io middleware function
   * @param fn
   */
  use(fn: SockIOMiddleware) {
    return this.io.use(fn);
  }

  async start() {
    const requestListener = this.getSync(WebsocketBindings.REQUEST_LISTENER);
    this._httpServer = new HttpServer(requestListener, this.config);
    await this._httpServer.start();
    this.io.attach(this._httpServer.server, this.options);
  }

  async stop() {
    await new Promise<void>((resolve, _reject) => {
      this.io.close(() => {
        resolve();
      });
    });
    if (this._httpServer) {
      await this._httpServer.stop();
    }
  }

  /**
   * Register a socketio controller
   * @param controllerClass
   * @param meta
   */
  route(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    controllerClass: Constructor<any>,
    meta?: WebsocketMetadata | string | RegExp,
  ): Namespace | Server {
    if (meta instanceof RegExp || typeof meta === 'string') {
      meta = {namespace: meta} as WebsocketMetadata;
    }
    if (meta == null) {
      meta = getWebsocketMetadata(controllerClass) as WebsocketMetadata;
    }
    const nsp = meta?.namespace ? this.io.of(meta.namespace) : this.io;
    if (meta?.name) {
      this.app.bind(getNamespaceKeyForName(meta.name)).to(nsp);
    }
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    nsp.on('connection', socket =>
      this.createSocketHandler(controllerClass)(socket),
    );
    return nsp;
  }

  protected createSocketHandler(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    controllerClass: Constructor<any>,
  ) {
    return async (socket: Socket) => {
      debug(
        'Websocket connected: id=%s namespace=%s',
        socket.id,
        socket.nsp.name,
      );
      try {
        await new WebsocketControllerFactory(
          this,
          controllerClass,
          socket,
        ).create();
      } catch (err) {
        debug(
          'Websocket error: error creating controller instance con connection',
          err,
        );
      }
    };
  }

  /**
   * Register a socket.io controller
   * @param controllerClass
   */
  controller(controllerClass: Constructor<unknown>) {
    debug('Adding controller %s', controllerClass.name);
    const binding = createBindingFromClass(controllerClass, {
      namespace: WebsocketBindings.CONTROLLERS_NAMESPACE,
      defaultScope: BindingScope.TRANSIENT,
    }).tag(WebsocketTags.SOCKET_IO, CoreTags.CONTROLLER);
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
}
