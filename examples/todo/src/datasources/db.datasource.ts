// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/core';
import {juggler, DataSource} from '@loopback/repository';
const config = require('./db.datasource.json');

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
      if (service.name === config.name) {
        config.url = service.credentials.url;
      }
    });
  });
}

// cf does not show .log() reliably, so have to use .warn()
console.warn(config);

export class DbDataSource extends juggler.DataSource {
  static dataSourceName = 'db';

  constructor(
    @inject('datasources.config.db', {optional: true})
    dsConfig: DataSource = config,
  ) {
    dsConfig = Object.assign({}, dsConfig, {
      // A workaround for the current design flaw where inside our monorepo,
      //  packages/service-proxy/node_modules/loopback-datasource-juggler cannot
      //  see/load the connector from examples/soap/node_modules/loopback-connector-soap
      //  as explained in todo example
      connector: require('loopback-connector-cloudant'),
    });
    super(dsConfig);
  }
}

function shouldConfigureForIbmCloud() {
  if (
    process.env.HOME === '/home/vcap/app' && // relatively reliable way to detect the app is running on IBM Cloud
    config.ibmCloud && // have to explicitly config datasource to mark it as an IBM Cloud service with a matching name locally
    process.env.VCAP_SERVICES // service should have been provisioned and bound to the app
  ) {
    return true;
  }
  return false;
}
