// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {AuthenticationBindings} from './keys';
import {Component, ProviderMap} from '@loopback/core';
import {AuthenticationProvider} from './providers/authenticate';
import {AuthMetadataProvider} from './providers/auth-metadata';

export class AuthenticationComponent implements Component {
  providers?: ProviderMap;

  // TODO(bajtos) inject configuration
  constructor() {
    this.providers = {
      [AuthenticationBindings.AUTH_ACTION]: AuthenticationProvider,
      [AuthenticationBindings.METADATA]: AuthMetadataProvider,
    };
  }
}
