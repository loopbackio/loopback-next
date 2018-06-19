// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/core';
import {juggler, AnyObject} from '@loopback/repository';
const config = require('./geocoder.datasource.json');

export class GeocoderDataSource extends juggler.DataSource {
  static dataSourceName = 'geocoder';

  constructor(
    @inject('datasources.config.geocoder', {optional: true})
    dsConfig: AnyObject = config,
  ) {
    dsConfig = Object.assign({}, dsConfig, {
      // A workaround for the current design flaw where inside our monorepo,
      //   packages/service-proxy/node_modules/loopback-datasource-juggler
      // cannot see/load the connector from
      //   examples/todo/node_modules/loopback-connector-rest
      connector: require('loopback-connector-rest'),
    });
    super(dsConfig);
  }
}
