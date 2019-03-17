// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as debugFactory from 'debug';
import {Socket} from 'socket.io';
import {socketio} from '../../..';

const debug = debugFactory('loopback:socketio:controller');

/**
 * A demo controller for socket.io
 */
@socketio(/^\/chats\/.+$/)
export class SocketIOController {
  constructor(
    @socketio.socket() // Equivalent to `@inject('ws.socket')`
    private socket: Socket,
  ) {}

  /**
   * The method is invoked when a client connects to the server
   * @param socket
   */
  @socketio.connect()
  connect(socket: Socket) {
    debug('Client connected: %s', this.socket.id);
    socket.join('room 1');
  }

  /**
   * Register a handler for 'chat message' events
   * @param msg
   */
  @socketio.subscribe('chat message')
  // @socketio.emit('namespace' | 'requestor' | 'broadcast')
  handleChatMessage(msg: unknown) {
    debug('Chat message: %s', msg);
    this.socket.nsp.emit('chat message', `[${this.socket.id}] ${msg}`);
  }

  /**
   * Register a handler for all events
   * @param msg
   */
  @socketio.subscribe(/.+/)
  logMessage(...args: unknown[]) {
    debug('Message: %s', args);
  }

  /**
   * The method is invoked when a client disconnects from the server
   * @param socket
   */
  @socketio.disconnect()
  disconnect() {
    debug('Client disconnected: %s', this.socket.id);
  }
}
