// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  BindingScope,
  Constructor,
  Context,
  CoreBindings,
  DecoratorType,
  invokeMethod,
  MetadataAccessor,
  MetadataInspector,
  MetadataMap,
} from '@loopback/core';
import {Socket} from 'socket.io';
import {
  SOCKET_IO_CONNECT_METADATA,
  SOCKET_IO_SUBSCRIBE_METADATA,
} from './decorators';
import {SocketIoBindings} from './keys';
import {SocketIoDoneFunction} from './types';

type SocketIoEventMatcherInfo = {
  matcher: string | RegExp;
  methodNames: string[];
};

/**
 * Request context for a socket.io request
 */
export class SocketIoConnectionContext extends Context {
  constructor(public readonly socket: Socket, parent: Context) {
    super(parent);
  }
}

/**
 * A factory to instantiate socket.io controllers
 */
export class SocketIoControllerFactory {
  private controller: {[method: string]: Function};
  public readonly connCtx: SocketIoConnectionContext;

  constructor(
    parentCtx: Context,
    private controllerClass: Constructor<unknown>,
    socket: Socket,
  ) {
    this.connCtx = new SocketIoConnectionContext(socket, parentCtx);
    this.connCtx.bind(SocketIoBindings.SOCKET).to(this.connCtx.socket);
    this.connCtx.bind(CoreBindings.CONTROLLER_CLASS).to(this.controllerClass);
    this.connCtx
      .bind(CoreBindings.CONTROLLER_CURRENT)
      .toClass(controllerClass)
      .inScope(BindingScope.SINGLETON);
  }

  async create() {
    // Instantiate the controller instance
    this.controller = await this.connCtx.get<{[method: string]: Function}>(
      CoreBindings.CONTROLLER_CURRENT,
    );
    await this.setup();
    return this.controller;
  }

  /**
   * Set up the controller for the given socket
   */
  async setup() {
    await this.connect();
    this.registerSubscribeMethods();
  }

  async connect() {
    const connectMethods = this.getDecoratedMethodsForConnect();
    for (const methodName in connectMethods) {
      await invokeMethod(this.controller, methodName, this.connCtx, [
        this.connCtx.socket,
      ]);
    }
  }

  protected registerSubscribeMethods() {
    const methodsByEventHandler = this.getDecorateSubscribeMethodsByEventName();
    const regexMethodsHandlers = new Map<RegExp, Function[]>();
    const methodHandlers = new Map<String, (...args: unknown[]) => unknown>();
    methodsByEventHandler.forEach(eventMatcherInfo => {
      const {matcher, methodNames} = eventMatcherInfo;
      methodNames.forEach(methodName => {
        let handler = methodHandlers.get(methodName);
        if (!handler) {
          handler = this.getCallback(methodName);
          methodHandlers.set(methodName, handler);
        }
        if (matcher instanceof RegExp) {
          const handlers = regexMethodsHandlers.get(matcher) ?? [];
          handlers.push(handler);
          regexMethodsHandlers.set(matcher, handlers);
        } else {
          this.connCtx.socket.on(matcher, handler);
        }
      });
    });
    // Register event handlers with regexp
    if (regexMethodsHandlers.size) {
      // Use a socket middleware to match event names with regexp
      this.connCtx.socket.use(async (packet, next) => {
        const [eventName, ...args] = packet;
        for (const iterator of regexMethodsHandlers.entries()) {
          const [regex, handlers] = iterator;
          if (eventName.match(regex)) {
            for (const handler of handlers) {
              await handler(args);
            }
          }
        }
        next();
      });
    }
  }

  getDecoratedMethodsForConnect() {
    return this.getAllMethodMetadataForKey(SOCKET_IO_CONNECT_METADATA);
  }

  getDecorateSubscribeMethodsByEventName() {
    const eventMatchersInfo = new Map<string, SocketIoEventMatcherInfo>();
    const subscribeMethods = this.getDecorateSubscribeMethods();
    for (const methodName in subscribeMethods) {
      for (const matcher of subscribeMethods[methodName]) {
        const matcherString = matcher.toString();
        const eventMatcherInfo: SocketIoEventMatcherInfo =
          eventMatchersInfo.get(matcherString) ?? {
            matcher: matcher,
            methodNames: [],
          };
        eventMatcherInfo.methodNames.push(methodName);
        eventMatchersInfo.set(matcherString, eventMatcherInfo);
      }
    }
    return eventMatchersInfo;
  }

  protected getDecorateSubscribeMethods() {
    return this.getAllMethodMetadataForKey(SOCKET_IO_SUBSCRIBE_METADATA);
  }

  protected getAllMethodMetadataForKey<V, DT extends DecoratorType>(
    metadataAccessor: MetadataAccessor<V, DT>,
  ): MetadataMap<V> {
    return (
      MetadataInspector.getAllMethodMetadata(
        metadataAccessor,
        this.controllerClass.prototype,
      ) ?? ({} as MetadataMap<V>)
    );
  }

  public getCallback(methodName: string) {
    return async (...args: unknown[]) => {
      let done: SocketIoDoneFunction = async (_response: unknown) => {};
      if (typeof args[args.length - 1] === 'function') {
        done = args.pop() as SocketIoDoneFunction;
      }
      const eventCtx = new Context(this.connCtx);
      eventCtx.bind(SocketIoBindings.MESSAGE).to(args);
      const sequence = await eventCtx.get(SocketIoBindings.SEQUENCE);
      await sequence.handle(methodName, args, done);
    };
  }
}
