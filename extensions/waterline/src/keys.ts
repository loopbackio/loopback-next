// Copyright IBM Corp. 2021. All Rights Reserved.
// Node module: @loopback/waterline
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey, CoreBindings} from '@loopback/core';
import {Config, Waterline} from 'waterline';
import {LoopbackWaterlineComponent} from './component';

/**
 * Binding keys used by this component.
 */
export namespace WaterlineBindings {
  export const NAMESPACE = 'waterline';
  export const ORM_INSTANCE = BindingKey.create<Waterline>(
    `${NAMESPACE}.instance`,
  );
  export const ADAPTER_NAMESPACE = BindingKey.create<Config['datastores']>(
    `${NAMESPACE}.datastores`,
  );
  export const ADAPTER_TAG = 'waterlineAdapters';
  export const DATASTORE_NAMESPACE = BindingKey.create<Config['datastores']>(
    `${NAMESPACE}.datastores`,
  );
  export const DATASTORE_TAG = 'waterlineDatastores';
  export const COMPONENT = BindingKey.create<LoopbackWaterlineComponent>(
    `${CoreBindings.COMPONENTS}.LoopbackWaterlineComponent`,
  );
}
