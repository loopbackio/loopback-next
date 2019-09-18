// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {bind, Component, ContextTags, ProviderMap} from '@loopback/core';
import {AuthenticationBindings} from './keys';
import {
  AuthenticateActionProvider,
  AuthenticationStrategyProvider,
  AuthMetadataProvider,
} from './providers';

@bind({tags: {[ContextTags.KEY]: AuthenticationBindings.COMPONENT}})
export class AuthenticationComponent implements Component {
  providers?: ProviderMap;

  constructor() {
    this.providers = {
      [AuthenticationBindings.AUTH_ACTION.key]: AuthenticateActionProvider,
      [AuthenticationBindings.STRATEGY.key]: AuthenticationStrategyProvider,
      [AuthenticationBindings.METADATA.key]: AuthMetadataProvider,
    };
  }
}
