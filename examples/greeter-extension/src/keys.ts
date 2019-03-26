// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-greeter-extension
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey, MetadataAccessor} from '@loopback/context';
import {GreetingService} from './greeting-service';

/**
 * Strongly-typed binding key for GreetingService
 */
export const GREETING_SERVICE = BindingKey.create<GreetingService>(
  'services.GreetingService',
);

export const EXTENSION_POINT_NAME = MetadataAccessor.create<
  {name: string},
  ClassDecorator
>('extensionPoint.name');
