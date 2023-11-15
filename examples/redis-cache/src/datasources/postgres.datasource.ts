import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'postgres',
  connector: require('loopback-connector-postgresql'),
  url: 'postgres://postgres:root@localhost:5438/redis_demo',
  host: 'localhost',
  port: 5438,
  user: 'postgres',
  password: 'root',
  database: 'redis_demo',
  schema: 'products',
};

@lifeCycleObserver('datasource')
export class PostgresDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'postgres';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.postgres', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
