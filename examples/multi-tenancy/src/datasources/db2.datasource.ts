// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/example-multi-tenancy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'db.xyz',
  connector: 'memory',
};

@lifeCycleObserver('datasource')
export class Db2DataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'db.xyz';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.db2', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
