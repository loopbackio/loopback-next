// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'geocoder',
  // A workaround for the current design flaw where inside our monorepo,
  //   packages/service-proxy/node_modules/loopback-datasource-juggler
  // cannot see/load the connector from
  //   examples/todo/node_modules/loopback-connector-rest
  connector: require('loopback-connector-rest'),
  options: {
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    timeout: 15000,
  },
  operations: [
    {
      template: {
        method: 'GET',
        url:
          'https://geocoding.geo.census.gov/geocoder/locations/onelineaddress',
        query: {
          format: '{format=json}',
          benchmark: 'Public_AR_Current',
          address: '{address}',
        },
        responsePath: '$.result.addressMatches[*].coordinates',
      },
      functions: {
        geocode: ['address'],
      },
    },
  ],
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class GeocoderDataSource
  extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'geocoder';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.geocoder', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
