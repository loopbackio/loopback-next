// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/metrics
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey, CoreBindings} from '@loopback/core';
import {MetricsComponent} from './metrics.component';

/**
 * Binding keys used by this component.
 */
export namespace MetricsBindings {
  export const COMPONENT = BindingKey.create<MetricsComponent>(
    `${CoreBindings.COMPONENTS}.MetricsComponent`,
  );
}
