// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ApplicationConfig} from '@loopback/core';
import {once} from 'events';
import express from 'express';
import http from 'http';
import {AddressInfo} from 'net';
import * as path from 'path';
import {OAuth2LoginApplication} from './application';

export {ApplicationConfig};

/**
 * An express server with multiple apps
 *
 *  1. WEB App
 *       a. An express web app which requires various user sign up provisions
 *       b. The express router is mounted in the root '/' path
 *  2. LB4 API server
 *       a. LB4 application provides passport login services for the express app
 *       b. The LB4 login apis are wrapped with session middleware to allow client sessions with user profiles
 */
export class ExpressServer {
  public webApp: express.Application;
  public readonly lbApp: OAuth2LoginApplication;
  private server?: http.Server;
  public url: String;

  constructor(options: ApplicationConfig = {}) {
    // Express Web App
    this.webApp = require('../web-application/express-app');
    // LB4 App
    this.lbApp = new OAuth2LoginApplication(options);

    /**
     * bind the oauth2 options to lb app
     * TODO:
     *    1. allow to change client_id and client_secret after application startup
     *    2. allow to read oauth2 app registrations from a datastore
     */
    this.lbApp.bind('facebookOAuth2Options').to(options.facebookOptions);
    this.lbApp.bind('googleOAuth2Options').to(options.googleOptions);
    this.lbApp.bind('customOAuth2Options').to(options.oauth2Options);

    // Serve static files in the public folder
    this.webApp.use(express.static(path.join(__dirname, '../public')));

    /**
     * Mount the LB4 app router in /api path
     */
    this.webApp.use('/api', this.lbApp.requestHandler);
  }

  public async boot() {
    await this.lbApp.boot();
  }

  /**
   * Start the express app and the lb4 app
   */
  public async start() {
    await this.lbApp.start();
    const port = this.lbApp.restServer.config.port ?? 3000;
    const host = this.lbApp.restServer.config.host ?? 'localhost';
    this.server = this.webApp.listen(port, host);
    await once(this.server, 'listening');
    const add = <AddressInfo>this.server.address();
    this.url = `http://${add.address}:${add.port}`;
  }

  /**
   * Stop lb4 and express apps
   */
  public async stop() {
    if (!this.server) return;
    await this.lbApp.stop();
    this.server.close();
    await once(this.server, 'close');
    this.server = undefined;
  }
}
