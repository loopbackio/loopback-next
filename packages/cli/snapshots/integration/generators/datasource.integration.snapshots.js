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
  localStorage: null,
  file: null
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
  localStorage: null,
  file: null
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
  dsn: null,
  host: null,
  port: 100,
  user: null,
  password: null,
  database: null,
  schema: null
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
  baseURL: null,
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

exports[`lb4 datasource integration correctly coerces setting input of type object and array with config 1`] = `
import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'ds',
  connector: 'rest',
  localConfigOnly: true,
  sharedData: {},
  forwardErrorToEnvironment: false,
  skipInstall: true,
  skipCache: true,
  skipLocalCache: true,
  force: true,
  'skip-cache': true,
  'skip-install': true,
  resolved: '/home/aaqilniz/working-space/patrick/forked/loopback-next/packages/cli/generators/datasource/index.js',
  namespace: 'home:aaqilniz:working-space:patrick:forked:loopback-next:packages:cli:datasource',
  _: [],
  config: '{"name":"ds","connector":"rest","options":"{\\"test\\": \\"value\\"}","operations":"[\\"get\\", \\"post\\"]"}',
  yes: true,
  'force-install': false,
  'ask-answered': false,
  c: '{"name":"ds","connector":"rest","options":"{\\"test\\": \\"value\\"}","operations":"[\\"get\\", \\"post\\"]"}',
  y: [
    '@@_YEOMAN_EMPTY_MARKER_@@',
    true
  ],
  options: {
    test: 'value'
  },
  operations: [
    'get',
    'post'
  ],
  baseURL: null,
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
  database: null,
  username: 'user',
  password: 'pass',
  modelIndex: null
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
