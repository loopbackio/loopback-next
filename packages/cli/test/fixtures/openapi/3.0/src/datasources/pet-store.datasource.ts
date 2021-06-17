// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'petStore',
  connector: 'openapi',
  spec: 'petstore-expanded.yaml',
  validate: false,
  positional: false,
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class PetStoreDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'petStore';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.petStore', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
