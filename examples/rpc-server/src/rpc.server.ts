// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-rpc-server
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject, Context} from '@loopback/context';
import {Server, Application, CoreBindings} from '@loopback/core';
import * as express from 'express';
import * as http from 'http';
import * as pEvent from 'p-event';
import {rpcRouter} from './rpc.router';

export class RPCServer extends Context implements Server {
  _server: http.Server;
  expressServer: express.Application;
  listening: boolean = false;
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) public app?: Application,
    @inject('rpcServer.config') public config?: RPCServerConfig,
  ) {
    super(app);
    this.config = config || {};
    this.expressServer = express();
    rpcRouter(this);
  }

  async start(): Promise<void> {
    this._server = this.expressServer.listen(
      (this.config && this.config.port) || 3000,
    );
    this.listening = true;
    return await pEvent(this._server, 'listening');
  }
  async stop(): Promise<void> {
    this._server.close();
    this.listening = false;
    return await pEvent(this._server, 'close');
  }
}

export type RPCServerConfig = {
  port?: number;
  // tslint:disable-next-line:no-any
  [key: string]: any;
};
