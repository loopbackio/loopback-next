// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {socketio} from '@loopback/socketio';
import debugFactory from 'debug';
import {Socket} from 'socket.io';

const debug = debugFactory('loopback:socketio:controller');

/**
 * A demo controller for socket.io
 */
@socketio('/')
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
  @socketio.subscribe('subscribe-to-channel')
  // @socketio.emit('namespace' | 'requestor' | 'broadcast')
  registerChannel(msg: string[]) {
    debug('Chat message: %s', msg);
    if (Array.isArray(msg) && msg.length > 0) {
      msg.forEach(item => {
        console.log('Connecting to ', item);
        this.socket.join(item);
      });
    } else {
      throw new Error('Channels data not appropriate');
    }
  }

  /**
   * Register a handler for 'general-message' events
   * @param msg
   */
  @socketio.subscribe('general-message')
  // @socketio.emit('namespace' | 'requestor' | 'broadcast')
  handleChatMessage(msg: string) {
    debug('General Message : %s', msg);
    const parsedMsg: {
      subject: string;
      body: string;
      receiver: {
        to: {
          id: string;
          name?: string;
        }[];
      };
      type: string;
      sentDate: Date;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options?: any;
    } = JSON.parse(msg);
    if (
      !parsedMsg ||
      !parsedMsg.receiver ||
      !parsedMsg.receiver.to ||
      parsedMsg.receiver.to.length <= 0
    ) {
      throw new Error('Inappropriate message data');
    } else {
      parsedMsg.receiver.to.forEach(item =>
        this.socket.nsp.to(item.id).emit(
          'general-message',
          JSON.stringify({
            subject: parsedMsg.subject,
            body: parsedMsg.body,
            options: parsedMsg.options,
          }),
        ),
      );
    }
  }

  /**
   * Register a handler for all events
   * @param msg
   */
  @socketio.subscribe(/.+/)
  logMessage(...args: unknown[]) {
    debug('Message: %s', args);
    console.log('Msg:: ', args);
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
