import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './ds.datasource.json';

export class DsDataSource extends juggler.DataSource {
  static dataSourceName = 'ds';

  constructor(
    @inject('datasources.config.ds', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
