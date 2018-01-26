import {inject, Context} from '@loopback/context';
import {Server, Application, CoreBindings} from '@loopback/core';
import * as express from 'express';
import * as http from 'http';
import * as pEvent from 'p-event';
import {rpcRouter} from '.';

export class RPCServer extends Context implements Server {
  _server: http.Server;
  expressServer: express.Application;
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
    return await pEvent(this._server, 'listening');
  }
  async stop(): Promise<void> {
    this._server.close();
    return await pEvent(this._server, 'close');
  }
}

export type RPCServerConfig = {
  port?: number;
  // tslint:disable-next-line:no-any
  [key: string]: any;
};
