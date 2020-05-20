// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from '@loopback/core';
import {AuthenticationComponent} from '@loopback/authentication';
import {CrudRestComponent} from '@loopback/rest-crud';

export function addComponent(app: Application) {
  app.component(AuthenticationComponent);
  app.component(CrudRestComponent);
}
