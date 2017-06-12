// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from './application';
import {Context} from '@loopback/context';
import {createServer, ServerRequest, ServerResponse} from 'http';

const debug = require('debug')('loopback:core:server');

export class Server extends Context {
  public state: ServerState;

  constructor(
    public app: Application,
    public config: ServerConfig = {port: 3000},
  ) {
    super();
    this.state = ServerState.cold;
  }

  async start() : Promise<void> {
    this.state = ServerState.starting;

    const server = createServer((req, res) => this._handleRequest(req, res));
    server.listen(this.config.port);


    return new Promise<void>((resolve, reject) => {
      server.once('listening', () => {
        // FIXME(bajtos) The updated port number should be part of "status"
        // object, we shouldn't be changing original config IMO.
        // Consider exposing full base URL including http/https scheme prefix
        try {
          this.config.port = server.address().port;
          this.state = ServerState.listening;
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  protected _handleRequest(req: ServerRequest, res: ServerResponse) {
    this.app.handleHttp(req, res).catch((err: Error) => {
      this._onUnhandledError(req, res, err);
    });
  }

  protected _onUnhandledError(
    req: ServerRequest,
    res: ServerResponse,
    err: Error,
  ): void {
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end();
    }

    // It's the responsibility of the Application to handle any errors.
    // If an unhandled error escaped, then something very wrong happened
    // and it's best to crash the process immediately.
    process.nextTick(() => {
      throw err;
    });
  }
}

export interface ServerConfig {
  port: number;
}

export enum ServerState {
  cold,
  starting,
  listening,
  crashed,
  stopped,
}
