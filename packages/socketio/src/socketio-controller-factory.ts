// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Constructor, invokeMethod, MetadataInspector} from '@loopback/context';
import {CoreBindings} from '@loopback/core';
import {SocketIORequestContext} from './socketio.server';

export class SocketIOControllerFactory {
  private controller: {[method: string]: Function};

  constructor(
    private reqCtx: SocketIORequestContext,
    private controllerClass: Constructor<unknown>,
  ) {}

  async create() {
    // Instantiate the controller instance
    this.controller = await this.reqCtx.get<{[method: string]: Function}>(
      CoreBindings.CONTROLLER_CURRENT,
    );
    await this.setup();
    return this.controller;
  }

  async connect() {
    const connectMethods =
      MetadataInspector.getAllMethodMetadata(
        'socketio:connect',
        this.controllerClass.prototype,
      ) || {};
    for (const m in connectMethods) {
      await invokeMethod(this.controller, m, this.reqCtx, [this.reqCtx.socket]);
    }
  }

  registerSubscribeMethods() {
    const regexpEventHandlers = new Map<
      RegExp[],
      (...args: unknown[]) => Promise<void>
    >();
    const subscribeMethods =
      MetadataInspector.getAllMethodMetadata<(string | RegExp)[]>(
        'socketio:subscribe',
        this.controllerClass.prototype,
      ) || {};
    for (const m in subscribeMethods) {
      for (const t of subscribeMethods[m]) {
        const regexps: RegExp[] = [];
        if (typeof t === 'string') {
          this.reqCtx.socket.on(t, async (...args: unknown[]) => {
            await invokeMethod(this.controller, m, this.reqCtx, args);
          });
        } else if (t instanceof RegExp) {
          regexps.push(t);
        }
        if (regexps.length) {
          // Build a map of regexp based message handlers
          regexpEventHandlers.set(regexps, async (...args: unknown[]) => {
            await invokeMethod(this.controller, m, this.reqCtx, args);
          });
        }
      }
    }
    return regexpEventHandlers;
  }

  /**
   * Set up the controller for the given socket
   * @param socket
   */
  async setup() {
    // Invoke connect handlers
    await this.connect();

    // Register event handlers
    const regexpHandlers = this.registerSubscribeMethods();

    // Register event handlers with regexp
    if (regexpHandlers.size) {
      // Use a socket middleware to match event names with regexp
      this.reqCtx.socket.use(async (packet, next) => {
        const eventName = packet[0];
        for (const e of regexpHandlers.entries()) {
          if (e[0].some(re => !!eventName.match(re))) {
            const handler = e[1];
            const args = [packet[1]];
            if (packet[2]) {
              // TODO: Should we auto-ack?
              // Ack callback
              args.push(packet[2]);
            }
            await handler(args);
          }
        }
        next();
      });
    }
  }
}
