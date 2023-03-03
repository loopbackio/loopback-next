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

export const config = datasourceTestConfig['primary']['sqlite3'];

@lifeCycleObserver('datasource')
export class PrimaryDataSource
  extends SequelizeDataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'primary';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.primary', {optional: true})
    dsConfig: SequelizeDataSourceConfig = config,
  ) {
    super(dsConfig);
  }
}
