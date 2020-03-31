// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  inject,
  lifeCycleObserver,
  LifeCycleObserver,
  ValueOrPromise,
} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'petStore',
  connector: 'openapi',
  spec: 'petstore-expanded.yaml',
  validate: false,
  positional: false,
};

@lifeCycleObserver('datasource')
export class PetStoreDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'petStore';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.petStore', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }

  /**
   * Start the datasource when application is started
   */
  start(): ValueOrPromise<void> {
    // Add your logic here to be invoked when the application is started
  }

  /**
   * Disconnect the datasource when application is stopped. This allows the
   * application to be shut down gracefully.
   */
  stop(): ValueOrPromise<void> {
    return super.disconnect();
  }
}
