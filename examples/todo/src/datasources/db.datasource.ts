// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import process = require('process');
import {inject} from '@loopback/core';
import {juggler, DataSource} from '@loopback/repository';
const config = require('./db.datasource.json');

if (shouldConfigureForIbmCloud()) {
  const services = JSON.parse(process.env.VCAP_SERVICES!);
  Object.keys(services).forEach(key => {
    const service = services[key];
    if (service.name === config.name) {
      config.url = service.url;
    }
  });
}

export class DbDataSource extends juggler.DataSource {
  static dataSourceName = 'db';

  constructor(
    @inject('datasources.config.db', {optional: true})
    dsConfig: DataSource = config,
  ) {
    super(dsConfig);
  }
}

function shouldConfigureForIbmCloud() {
  if (
    process.env.HOME === '/home/vcap' &&
    config.ibmCloud &&
    process.env.VCAP_SERVICES
  ) {
    return true;
  }
  return false;
}
