import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'cache',
  connector: require('loopback-connector-kv-redis'),
  host: 'localhost',
  port: 6379,
  db: 0,
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class CacheDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'cache';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.cache', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
