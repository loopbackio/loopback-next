// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  ClassDecoratorFactory,
  Constructor,
  inject,
  MetadataAccessor,
  MetadataInspector,
  MethodDecoratorFactory,
} from '@loopback/core';
import {SocketIoBindings} from '../keys';

/**
 * Metadata for SocketIo
 */
export interface SocketIoMetadata {
  name?: string;
  namespace?: string | RegExp;
}

export const SOCKET_IO_METADATA = MetadataAccessor.create<
  SocketIoMetadata,
  ClassDecorator
>('socketio');

export const SOCKET_IO_SUBSCRIBE_METADATA = MetadataAccessor.create<
  (string | RegExp)[],
  MethodDecorator
>('socketio:subscribe');

export const SOCKET_IO_CONNECT_METADATA = MetadataAccessor.create<
  boolean,
  MethodDecorator
>('socketio:connect');

/**
 * Decorate a socketio controller class to specify the namespace.
 *
 * @example
 * ```ts
 * @socketio({namespace: '/chats'})
 * export class SocketIoController {}
 * ```
 * @param spec A namespace or object
 */
export function socketio(spec: SocketIoMetadata | string | RegExp = {}) {
  if (typeof spec === 'string' || spec instanceof RegExp) {
    spec = {namespace: spec};
  }
  return ClassDecoratorFactory.createDecorator(SOCKET_IO_METADATA, spec);
}

export function getSocketIoMetadata(controllerClass: Constructor<unknown>) {
  return MetadataInspector.getClassMetadata(
    SOCKET_IO_METADATA,
    controllerClass,
  );
}

export namespace socketio {
  export function io() {
    return inject(SocketIoBindings.IO);
  }

  export function namespace(name: string) {
    return inject(`socketio.namespace.${name}`);
  }

  export function socket() {
    return inject(SocketIoBindings.SOCKET);
  }

  /**
   * Decorate a method to subscribe to socketio events.
   * For example,
   * ```ts
   * @socketio.subscribe('chat message')
   * async function onChat(msg: string) {
   * }
   * ```
   * @param messageTypes
   */
  export function subscribe(...messageTypes: (string | RegExp)[]) {
    return MethodDecoratorFactory.createDecorator(
      SOCKET_IO_SUBSCRIBE_METADATA,
      messageTypes,
    );
  }

  /**
   * Decorate a controller method for `disconnect`
   */
  export function disconnect() {
    return subscribe('disconnect');
  }

  /**
   * Decorate a controller method for `connect`
   */
  export function connect() {
    return MethodDecoratorFactory.createDecorator(
      SOCKET_IO_CONNECT_METADATA,
      true,
    );
  }
}
