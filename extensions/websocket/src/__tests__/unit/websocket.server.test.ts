// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/authentication-jwt
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {Namespace, Server} from 'socket.io';
import {WebsocketBindings} from '../../keys';
import {WebsocketComponent} from '../../websocket.component';
import {getNamespaceKeyForName, WebsocketServer} from '../../websocket.server';
import {
  DummyTestController,
  SampleTestController,
  SAMPLE_CONTROLER_NSP,
} from '../fixtures/ws-controllers';

describe('WebsocketServer', () => {
  let io: Server;
  let app: Application, websocketServer: WebsocketServer;

  before(() => {
    app = new Application();
    app.component(WebsocketComponent);
    websocketServer = new WebsocketServer(app);
    io = app.getSync(WebsocketBindings.IO);
  });

  it('app bind io Server instance', async () => {
    expect(io).to.be.not.null();
    // TODO: Check is a Server instance
    expect(io).to.be.a.instanceOf(Object);
  });

  it('must return io instance when registry without string route', () => {
    const nsp = websocketServer.route(DummyTestController);
    expect(nsp).to.be.equal(io);
    // TODO: Check is a Namespace instance
    expect(nsp).to.be.a.instanceOf(Object);
  });

  it('must return a nsp when a string route is specific it', () => {
    const stringNamespace = '/route/to/connect';
    const nsp = websocketServer.route(
      DummyTestController,
      stringNamespace,
    ) as Namespace;
    expect(nsp.name).to.be.equal(stringNamespace);
  });

  it('must return a nsp when a regex route is specific it', () => {
    const regexNamespace = /\/regexnamespace/;
    const nsp = websocketServer.route(
      DummyTestController,
      regexNamespace,
    ) as Namespace;
    // TODO: Check namespace regex
    expect(!!nsp.name).to.be.true();
  });

  it('must regsitry bind with the nsp when a name option is specific it', () => {
    const optionsName = 'customName';
    const nsp = websocketServer.route(DummyTestController, {
      name: optionsName,
    }) as Namespace;
    const bindedNsp = app.getSync(getNamespaceKeyForName(optionsName));
    expect(bindedNsp).to.be.equal(nsp);
  });

  it('must return a nsp when a controller setup with ws.controller decorator', () => {
    const nsp = websocketServer.route(SampleTestController) as Namespace;
    expect(nsp.name).to.be.equal(SAMPLE_CONTROLER_NSP);
  });
});
