// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import http = require('http');
import bluebird = require('bluebird');
import {Context} from './context';

export interface ServerConfig {
  port : number;
}

export enum ServerState {
  cold,
  starting,
  listening,
  crashed,
  stopped,
}

export class Server extends Context {
  // get runtime to enforce AppConfig as AppConfig
  constructor(public config?: ServerConfig) {
    super();
    if (config === undefined) {
      this.config = {port: 3000};
    }
  }

  public state: ServerState = ServerState.cold;

  async start() {
    this.state = ServerState.starting;
    const server = http.createServer((req, res) => {
      res.end();
    });
    const listen = bluebird.promisify(server.listen, {context: server});
    await listen(this.config.port);
    this.state = ServerState.listening;
  }
}
