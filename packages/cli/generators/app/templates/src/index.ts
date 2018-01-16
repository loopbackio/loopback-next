// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {<%= project.applicationName %>} from './application';
import {ApplicationConfig} from '@loopback/core';

export {<%= project.applicationName %>};

export async function main(options?: ApplicationConfig) {
  const app = new <%= project.applicationName %>(options);

  try {
    await app.start();
  } catch (err) {
    console.error(`Unable to start application: ${err}`);
  }
  return app;
}
