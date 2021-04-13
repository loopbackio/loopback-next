// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Binding,
  Component,
  ContextTags,
  createBindingFromClass,
  injectable,
} from '@loopback/core';
import {
  AuthenticateActionProvider,
  AuthenticationMiddlewareProvider,
  AuthenticationStrategyProvider,
  AuthMetadataProvider,
} from './providers';
import {AuthenticationBindings} from './keys';
import {SecuritySpecEnhancer} from './spec-enhancers/security.spec-enhancer';

@injectable({tags: {[ContextTags.KEY]: AuthenticationBindings.COMPONENT}})
export class AuthenticationComponent implements Component {
  providers = {
    [AuthenticationBindings.AUTH_ACTION.key]: AuthenticateActionProvider,
    [AuthenticationBindings.STRATEGY.key]: AuthenticationStrategyProvider,
    [AuthenticationBindings.METADATA.key]: AuthMetadataProvider,
    [AuthenticationBindings.AUTHENTICATION_MIDDLEWARE
      .key]: AuthenticationMiddlewareProvider,
  };

  bindings: Binding[] = [createBindingFromClass(SecuritySpecEnhancer)];
}
