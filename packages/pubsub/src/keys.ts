// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/pubsub
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey, CoreBindings} from '@loopback/core';
import {PubSubEngine} from 'graphql-subscriptions';
import {PubSubComponent} from './component';

export namespace PubSubBindings {
  export const COMPONENT = BindingKey.create<PubSubComponent>(
    `${CoreBindings.COMPONENTS}.PubSubComponent`,
  );

  export const ENGINE = BindingKey.create<PubSubEngine>('pubsub.PubSubEngine');
}
