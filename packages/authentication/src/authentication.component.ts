// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {AuthenticationBindings} from './keys';
import {Component, ProviderMap, Binding} from '@loopback/core';
import {AuthenticateActionProvider, AuthMetadataProvider} from './providers';

export class AuthenticationComponent implements Component {
  providers?: ProviderMap;
  bindings: Binding[] = [];

  // TODO(bajtos) inject configuration
  constructor() {
    this.providers = {
      [AuthenticationBindings.AUTH_ACTION.key]: AuthenticateActionProvider,
      [AuthenticationBindings.METADATA.key]: AuthMetadataProvider,
    };

    this.bindings.push(
      Binding.bind(AuthenticationBindings.CURRENT_USER).toDeferred(),
    );
  }
}
