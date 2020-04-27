import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'db.abc',
  connector: 'memory',
};

@lifeCycleObserver('datasource')
export class Db1DataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'db.abc';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.db1', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
