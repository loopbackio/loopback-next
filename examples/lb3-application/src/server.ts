// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/example-lb3-application
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ApplicationConfig} from '@loopback/core';
import express, {Request, Response} from 'express';
import http from 'http';
import {AddressInfo} from 'net';
import pEvent from 'p-event';
import path from 'path';
import {CoffeeShopApplication} from './application';

const loopback = require('loopback');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');

export class ExpressServer {
  private app: express.Application;
  public readonly lbApp: CoffeeShopApplication;
  public server?: http.Server;
  public url: String;

  constructor(options: ApplicationConfig = {}) {
    this.app = express();

    this.lbApp = new CoffeeShopApplication(options);

    // Middleware migrated from LoopBack 3
    this.app.use(loopback.favicon());
    this.app.use(compression());
    this.app.use(cors());
    this.app.use(helmet());

    // Mount the LB4 REST API
    this.app.use('/api', this.lbApp.requestHandler);

    // Custom Express routes
    this.app.get('/ping', function (_req: Request, res: Response) {
      res.send('pong');
    });

    // Serve static files in the public folder
    this.app.use(express.static(path.join(__dirname, '../public')));
  }

  public async boot() {
    await this.lbApp.boot();
  }

  public async start() {
    await this.lbApp.start();
    const port = this.lbApp.restServer.config.port ?? 3000;
    const host = this.lbApp.restServer.config.host ?? '127.0.0.1';
    this.server = this.app.listen(port, host);
    await pEvent(this.server, 'listening');
    const add = <AddressInfo>this.server.address();
    this.url = `http://${add.address}:${add.port}`;
  }

  public async stop() {
    if (!this.server) return;
    await this.lbApp.stop();
    this.server.close();
    await pEvent(this.server, 'close');
    this.server = undefined;
  }
}
