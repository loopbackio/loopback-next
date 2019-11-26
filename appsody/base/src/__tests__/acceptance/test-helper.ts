import {DemoApplication} from '@loopback/appsody-user-app';
import {
  Client,
  createRestAppClient,
  givenHttpServerConfig,
} from '@loopback/testlab';
import * as path from 'path';
import {BootableRestApplication, launchApplication} from '../..';

export async function setupApplication(): Promise<AppWithClient> {
  const restConfig = givenHttpServerConfig({
    // Customize the server configuration here.
    // Empty values (undefined, '') will be ignored by the helper.
    //
    // host: process.env.HOST,
    // port: +process.env.PORT,
  });

  const app = await launchApplication({
    applicationProjectRoot: path.join(__dirname, '../../../../user-app/dist'),
    applicationClass: DemoApplication,
    rest: restConfig,
  });

  const client = createRestAppClient(app);

  return {app, client};
}

export interface AppWithClient {
  app: BootableRestApplication;
  client: Client;
}
