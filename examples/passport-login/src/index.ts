// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {RestApplication} from '@loopback/rest';
import * as path from 'path';
import {oauth2ProfileFunction} from './authentication-strategies';
import {ApplicationConfig, ExpressServer} from './server';

export * from './server';

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
 * bind resources to application
 * @param server
 */
export async function setupApplication(
  lbApp: RestApplication,
  dbBackupFile?: string,
) {
  lbApp.bind('datasources.config.db').to({
    name: 'db',
    connector: 'memory',
    localStorage: '',
    file: dbBackupFile ? path.resolve(__dirname, dbBackupFile) : undefined,
  });

  lbApp
    .bind('authentication.oauth2.profile.function')
    .to(oauth2ProfileFunction);
}

/**
 * Start this application
 * @param oauth2Providers
 */
export async function startApplication(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  oauth2Providers: any,
  dbBackupFile?: string,
): Promise<ExpressServer> {
  const config = await serverConfig(oauth2Providers);
  const server = new ExpressServer(config);
  await setupApplication(server.lbApp, dbBackupFile);
  await server.boot();
  await server.start();
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
    oauth2Providers = require('@loopback/mock-oauth2-provider');
  }
  const server: ExpressServer = await startApplication(
    oauth2Providers,
    process.env.DB_BKP_FILE_PATH, // eg: export DB_BKP_FILE_PATH=../data/db.json
  );
  console.log(`Server is running at ${server.url}`);
}

if (require.main === module) {
  main().catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
