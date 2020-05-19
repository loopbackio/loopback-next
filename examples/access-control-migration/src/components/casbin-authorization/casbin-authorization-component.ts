// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-access-control-migration
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {AuthorizationTags} from '@loopback/authorization';
import {Binding, Component} from '@loopback/core';
import {CasbinAuthorizationProvider, getCasbinEnforcerByName} from './services';

export class CasbinAuthorizationComponent implements Component {
  bindings: Binding[] = [
    Binding.bind('casbin.enforcer.factory').to(getCasbinEnforcerByName),
    Binding.bind('authorizationProviders.casbin-provider')
      .toProvider(CasbinAuthorizationProvider)
      .tag(AuthorizationTags.AUTHORIZER),
  ];
}
