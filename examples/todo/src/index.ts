// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {TodoListApplication} from './application';
import {ApplicationConfig} from '@loopback/core';
const datasourceDb = require('./datasources/db.datasource.json');

type VcapService = {
  name: string;
  credentials: {
    // tslint:disable-next-line:no-any
    [property: string]: any;
  };
};

if (shouldConfigureForIbmCloud()) {
  const services = JSON.parse(process.env.VCAP_SERVICES!);
  Object.keys(services).forEach(key => {
    const serviceGroup = services[key];

    // tslint:disable-next-line:no-any
    serviceGroup.forEach((service: VcapService) => {
      if (service.name === datasourceDb.vcapServiceName) {
        datasourceDb.url = service.credentials.url;
      }
    });
  });
}

export async function main(options?: ApplicationConfig) {
  // IBM Cloud app port is set on process.env.PORT
  if (!options) {
    options = {rest: {port: process.env.PORT}};
  } else {
    if (!options.rest) options.rest = {};
    options.rest.port = process.env.PORT || options.rest.port;
  }
  const app = new TodoListApplication(options);

  await app.boot();
  await app.bind('datasources.config.db').to(datasourceDb);
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  return app;
}

function shouldConfigureForIbmCloud() {
  if (
    datasourceDb.vcapServiceName && // have to explicitly config datasource to mark it as an IBM Cloud service with a matching name locally
    process.env.VCAP_SERVICES // service should have been provisioned and bound to the app
  ) {
    return true;
  }
  return false;
}
