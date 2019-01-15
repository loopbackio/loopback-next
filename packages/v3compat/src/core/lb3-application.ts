// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/v3compat
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from '@loopback/core';
import * as debugFactory from 'debug';
import {ModelClass} from './lb3-model';
import {Lb3Registry} from './lb3-registry';
import {DataSource, DataSourceConfig, ModelConfig} from './lb3-types';

const debug = debugFactory('loopback:v3compat:application');

export class Lb3Application {
  readonly registry: Lb3Registry;

  readonly dataSources: {
    [name: string]: DataSource;
  };

  readonly models: {
    [name: string]: ModelClass;
  };

  constructor(protected lb4app: Application) {
    this.registry = new Lb3Registry(lb4app);
    this.dataSources = Object.create(null);
    this.models = Object.create(null);
  }

  dataSource(name: string, config: DataSourceConfig): DataSource {
    debug('registering datasource %s with config %j', name, config);
    // TODO: use the implementation from LB3's lib/application.js
    const ds = this.registry.createDataSource(name, config);
    this.dataSources[name] = ds;
    return ds;
  }

  model(modelCtor: ModelClass, config: ModelConfig) {
    debug('registering model %s with config %s', modelCtor.modelName, config);
    // TODO: use the implementation from LB3's lib/application.js
    if (typeof config.dataSource === 'string') {
      const dataSource = this.dataSources[config.dataSource];
      config = Object.assign({}, config, {dataSource});
    }
    this.registry.configureModel(modelCtor, config);
    this.models[modelCtor.modelName] = modelCtor;
    modelCtor.app = this;
  }

  deleteModelByName(modelName: string): void {
    throw new Error('Not implemented yet.');
  }
}
