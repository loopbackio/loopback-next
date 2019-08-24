// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/authorization
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey, CoreBindings} from '@loopback/core';
import {AuthorizationComponent} from './authorization-component';
import {AuthorizationMetadata} from './types';

/**
 * Binding keys used by authorization component.
 */
export namespace AuthorizationBindings {
  export const METADATA = BindingKey.create<AuthorizationMetadata>(
    'authorization.operationMetadata',
  );

  export const COMPONENT = BindingKey.create<AuthorizationComponent>(
    `${CoreBindings.COMPONENTS}.AuthorizationComponent`,
  );
}

/**
 * Binding tags used by authorization component
 */
export namespace AuthorizationTags {
  /**
   * A tag for authorizers
   */
  export const AUTHORIZER = 'authorizer';
}
