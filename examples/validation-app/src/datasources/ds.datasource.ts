// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-validation-app
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'ds',
  connector: 'memory',
  localStorage: '',
  file: '',
};

@lifeCycleObserver('datasource')
export class DsDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'ds';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.ds', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
