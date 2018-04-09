// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Strategy} from 'passport';
import {AuthenticateFn, UserProfile} from './providers/authentication.provider';
import {AuthenticationMetadata} from './decorators/authenticate.decorator';
import {BindingKey, MetadataAccessor} from '@loopback/context';

/**
 * Binding keys used by this component.
 */
export namespace AuthenticationBindings {
  export const STRATEGY = BindingKey.create<Strategy | undefined>(
    'authentication.strategy',
  );

  export const AUTH_ACTION = BindingKey.create<AuthenticateFn>(
    'authentication.actions.authenticate',
  );

  export const METADATA = BindingKey.create<AuthenticationMetadata | undefined>(
    'authentication.operationMetadata',
  );

  export const CURRENT_USER = BindingKey.create<UserProfile | undefined>(
    'authentication.currentUser',
  );
}

/**
 * The key used to store log-related via @loopback/metadata and reflection.
 */
export const AUTHENTICATION_METADATA_KEY = MetadataAccessor.create<
  AuthenticationMetadata
>('authentication.operationsMetadata');
