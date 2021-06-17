// Copyright The LoopBack Authors 2018,2021. All Rights Reserved.
// Node module: @loopback/example-rpc-server
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  Context,
  CoreBindings,
  inject,
  Server,
} from '@loopback/core';
import {once} from 'events';
import express from 'express';
import http from 'http';
import {rpcRouter} from './rpc.router';

export class RPCServer extends Context implements Server {
  private _listening = false;
  _server: http.Server;
  expressServer: express.Application;

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) public app?: Application,
    @inject('rpcServer.config') public config?: RPCServerConfig,
  ) {
    super(app);
    this.config = config ?? {};
    this.expressServer = express();
    rpcRouter(this);
  }

  get listening() {
    return this._listening;
  }

  async start(): Promise<void> {
    this._server = this.expressServer.listen(this.config?.port ?? 3000);
    this._listening = true;
    await once(this._server, 'listening');
  }
  async stop(): Promise<void> {
    this._server.close();
    this._listening = false;
    await once(this._server, 'close');
  }
}

export type RPCServerConfig = {
  port?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};
