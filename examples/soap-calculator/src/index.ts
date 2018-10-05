import {SoapCalculatorApplication} from './application';
import {ApplicationConfig} from '@loopback/core';

export {SoapCalculatorApplication};

export async function main(options: ApplicationConfig = {}) {
  const app = new SoapCalculatorApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  return app;
}
