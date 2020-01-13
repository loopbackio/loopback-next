// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/core';
import {AnyObject, juggler} from '@loopback/repository';
import config from './geocoder.datasource.config.json';

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
