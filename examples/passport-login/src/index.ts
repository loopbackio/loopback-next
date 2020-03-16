// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ApplicationConfig} from '@loopback/core';
import {ExpressServer} from './server';
import * as path from 'path';
import {oauth2ProfileFunction} from './authentication-strategies';

export {ExpressServer};

/**
 * Prepare server config
 * @param oauth2Providers
 */
export async function serverConfig(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  oauth2Providers: any,
): Promise<ApplicationConfig> {
  const config = {
    rest: {
      port: +(process.env.PORT ?? 3000),
      host: process.env.HOST,
      protocol: 'http',
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        setServersFromRequest: true,
      },
      // Use the LB4 application as a route. It should not be listening.
      listenOnStart: false,
    },
    facebookOptions: oauth2Providers['facebook-login'],
    googleOptions: oauth2Providers['google-login'],
    oauth2Options: oauth2Providers['oauth2'],
  };
  return config;
}

/**
 * Setup and start express server
 * @param server
 */
export async function setupServer(server: ExpressServer) {
  const lbApp = server.lbApp;

  lbApp.bind('datasources.config.db').to({
    name: 'db',
    connector: 'memory',
    localStorage: '',
    file: path.resolve(__dirname, '../data/db.json'),
  });

  lbApp
    .bind('authentication.oauth2.profile.function')
    .to(oauth2ProfileFunction);

  await server.boot();
  await server.start();
}

/**
 * Start this application
 * @param oauth2Providers
 */
export async function startApplication(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  oauth2Providers: any,
): Promise<ExpressServer> {
  const config = await serverConfig(oauth2Providers);
  const server = new ExpressServer(config);
  await setupServer(server);
  return server;
}

/**
 * run main() to start application with oauth config
 */
export async function main() {
  let oauth2Providers;
  if (process.env.OAUTH_PROVIDERS_LOCATION) {
    oauth2Providers = require(process.env.OAUTH_PROVIDERS_LOCATION);
  } else {
    oauth2Providers = require('../oauth2-providers');
  }
  const server: ExpressServer = await startApplication(oauth2Providers);
  console.log(`Server is running at ${server.url}`);
}
