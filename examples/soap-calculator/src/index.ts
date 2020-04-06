// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/example-soap-calculator
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

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
