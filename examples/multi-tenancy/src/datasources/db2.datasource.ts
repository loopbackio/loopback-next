import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'db.xyz',
  connector: 'memory',
};

@lifeCycleObserver('datasource')
export class Db2DataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'db.xyz';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.db2', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
