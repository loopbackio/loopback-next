// Copyright The LoopBack Authors 2019,2021. All Rights Reserved.
// Node module: @loopback/example-graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  ContextTags,
  inject,
  lifeCycleObserver,
  LifeCycleObserver,
} from '@loopback/core';
import {juggler, RepositoryBindings} from '@loopback/repository';

const config = {
  name: 'recipes',
  connector: 'memory',
  localStorage: '',
  file: '',
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource', {
  tags: {
    [ContextTags.NAME]: 'recipes',
    [ContextTags.NAMESPACE]: RepositoryBindings.DATASOURCES,
  },
})
export class RecipesDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'recipes';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.recipes', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
