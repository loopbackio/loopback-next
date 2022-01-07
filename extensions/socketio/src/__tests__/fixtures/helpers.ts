// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Constructor} from '@loopback/core';
import {pEvent} from 'p-event';
import {Socket} from 'socket.io';
import io from 'socket.io-client';
import {SocketIoBindings} from '../../keys';
import {SocketIoControllerFactory} from '../../socketio-controller-factory';
import {SocketIoApplication} from '../../socketio.application';

export const withConnectedSockets = async (
  app: SocketIoApplication,
  urlEndpoint: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callbacks: (client: any, server: Socket) => Promise<void>,
) => {
  const url = app.socketServer.url + urlEndpoint;
  const ioServer = app.getSync(SocketIoBindings.IO);
  const nsp = ioServer.of(urlEndpoint);
  const serverPromise = pEvent(nsp, 'connection');
  const socket = io(url);
  const server = await serverPromise;
  await callbacks(socket, server);
  socket.disconnect();
};

export const getNewFactory = (
  app: SocketIoApplication,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controllerClass: Constructor<any>,
  socket: Socket,
) => new SocketIoControllerFactory(app.socketServer, controllerClass, socket);
