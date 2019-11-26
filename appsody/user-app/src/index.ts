import {DemoApplication} from './application';
import {ApplicationConfig} from '@loopback/core';

export {DemoApplication};

export async function main(options: ApplicationConfig = {}) {
  const app = new DemoApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}
