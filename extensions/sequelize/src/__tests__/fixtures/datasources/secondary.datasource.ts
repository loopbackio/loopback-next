import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {
  SequelizeDataSource,
  SequelizeDataSourceConfig,
} from '../../../sequelize';
import {datasourceTestConfig} from './config';

// DEVELOPMENT NOTE:
// "Few Test cases for database transaction features won't work for in-memory
// database configuration like sqlite3, change this to postgresql while developing to run
// all test cases of transactional repo including those of isolation levels.
// but ensure it's set to sqlite3 before commiting changes."
export const config = datasourceTestConfig['secondary']['sqlite3'];

@lifeCycleObserver('datasource')
export class SecondaryDataSource
  extends SequelizeDataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'secondary';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.secondary', {optional: true})
    dsConfig: SequelizeDataSourceConfig = config,
  ) {
    super(dsConfig);
  }
}
