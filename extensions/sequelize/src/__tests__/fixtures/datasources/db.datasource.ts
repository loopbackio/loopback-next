import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {
  SequelizeDataSource,
  SequelizeDataSourceConfig,
} from '../../../sequelize';

const config: SequelizeDataSourceConfig = {
  name: 'db',
  host: '0.0.0.0',
  connector: 'sqlite3',
  database: 'database',
  file: ':memory:',
};

@lifeCycleObserver('datasource')
export class DbDataSource
  extends SequelizeDataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'db';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.db', {optional: true})
    dsConfig: SequelizeDataSourceConfig = config,
  ) {
    super(dsConfig);
  }
}
