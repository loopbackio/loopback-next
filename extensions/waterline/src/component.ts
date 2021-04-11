// Copyright IBM Corp. 2021. All Rights Reserved.
// Node module: @loopback/waterline
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  BindingScope,
  Component,
  config,
  ContextTags,
  CoreBindings,
  filterByTag,
  Getter,
  inject,
  injectable,
  LifeCycleObserver,
  lifeCycleObserver,
} from '@loopback/core';
import {Config, Waterline} from 'waterline';
import {WaterlineBindings} from './keys';
import {
  DEFAULT_LOOPBACK_WATERLINE_OPTIONS,
  LoopbackWaterlineComponentOptions,
} from './types';

/**
 * @deorator
 * `@injectable({tags: {[ContextTags.KEY]: WaterlineBindings.COMPONENT}})`
 */
@injectable({
  tags: {[ContextTags.KEY]: WaterlineBindings.COMPONENT},
})
export class LoopbackWaterlineComponent implements Component {
  lifeCycleObservers = [WaterlineLifecycleObserver];

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private application: Application,
    @config()
    private options: LoopbackWaterlineComponentOptions = DEFAULT_LOOPBACK_WATERLINE_OPTIONS,
  ) {}
}

/**
 * @decorator
 * `@lifeCycleObserver('datasource', {scope: BindingScope.SINGLETON})`
 */
@lifeCycleObserver('datasource', {
  scope: BindingScope.SINGLETON,
})
export class WaterlineLifecycleObserver implements LifeCycleObserver {
  private _waterlineAdapters: Config['adapters'];

  constructor(
    @inject(WaterlineBindings.ORM_INSTANCE)
    private _waterlineInstance: Waterline,
    @inject.getter(filterByTag(WaterlineBindings.ADAPTER_TAG))
    private _waterlineAdaptersGetter: Getter<Config['adapters']>,
    @inject.getter(filterByTag(WaterlineBindings.DATASTORE_TAG))
    private _waterlineDatastoreGetter: Getter<Config['datastores']>,
  ) {}

  async start() {
    this._waterlineAdapters = await this._waterlineAdaptersGetter();
    this._waterlineInstance.initialize(
      {
        adapters: this._waterlineAdapters,
        datastores: await this._waterlineDatastoreGetter(),
      },
      (err, ontology) => {
        if (err) throw err;
      },
    );
  }

  async stop() {
    Object.keys(this._waterlineAdapters).forEach(adapter => {
      if (
        (this._waterlineAdapters[adapter] as Record<string, unknown>).teardown
      )
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this._waterlineAdapters[adapter].teardown(null);
    });
  }
}
