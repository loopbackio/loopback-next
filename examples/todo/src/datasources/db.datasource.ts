// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/core';
import {juggler, DataSource} from '@loopback/repository';
const config = require('./db.datasource.json');

export class DbDataSource extends juggler.DataSource {
  static dataSourceName = 'db';

  constructor(
    @inject('datasources.config.db', {optional: true})
    dsConfig: DataSource = config,
  ) {
    // FOR VISUAL CONFIRMATION PURPOSES
    // cf does not show .log() reliably, so have to use .warn()
    console.warn(config);

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
