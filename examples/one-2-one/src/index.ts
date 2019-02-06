import {One2oneApplication} from './application';
import {ApplicationConfig} from '@loopback/core';

export {One2oneApplication};

export async function main(options: ApplicationConfig = {}) {
  const app = new One2oneApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}
