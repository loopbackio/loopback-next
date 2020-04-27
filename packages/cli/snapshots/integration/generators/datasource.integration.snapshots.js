// IMPORTANT
// This snapshot file is auto-generated, but designed for humans.
// It should be checked into source control and tracked carefully.
// Re-generate by setting UPDATE_SNAPSHOTS=1 and running tests.
// Make sure to inspect the changes in the snapshots below.
// Do not ignore changes!

'use strict';

exports[`lb4 datasource integration basic datasource scaffolds correct file with args 1`] = `
import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'ds',
  connector: 'memory',
  localStorage: undefined,
  file: undefined
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The \`stop()\` method is inherited from \`juggler.DataSource\`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class DsDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'ds';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.ds', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}

`;


exports[`lb4 datasource integration basic datasource scaffolds correct file with input 1`] = `
import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'ds',
  connector: 'memory',
  localStorage: undefined,
  file: undefined
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The \`stop()\` method is inherited from \`juggler.DataSource\`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class DsDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'ds';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.ds', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}

`;


exports[`lb4 datasource integration correctly coerces setting input of type number 1`] = `
import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'ds',
  connector: 'db2',
  dsn: undefined,
  host: undefined,
  port: 100,
  user: undefined,
  password: undefined,
  database: undefined,
  schema: undefined
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The \`stop()\` method is inherited from \`juggler.DataSource\`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class DsDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'ds';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.ds', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}

`;


exports[`lb4 datasource integration correctly coerces setting input of type object and array 1`] = `
import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'ds',
  connector: 'rest',
  baseURL: undefined,
  options: {
    test: 'value'
  },
  operations: [
    'get',
    'post'
  ],
  crud: false
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The \`stop()\` method is inherited from \`juggler.DataSource\`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class DsDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'ds';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.ds', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}

`;


exports[`lb4 datasource integration scaffolds correct file with cloudant input 1`] = `
import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'ds',
  connector: 'cloudant',
  url: 'http://user:pass@host.com',
  database: undefined,
  username: 'user',
  password: 'pass',
  modelIndex: undefined
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The \`stop()\` method is inherited from \`juggler.DataSource\`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class DsDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'ds';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.ds', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}

`;
