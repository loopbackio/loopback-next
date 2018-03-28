// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/authorization
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Component, createBindingFromClass} from '@loopback/core';
import {AuthorizationInterceptor} from './authorize-interceptor';

export class AuthorizationComponent implements Component {
  bindings = [createBindingFromClass(AuthorizationInterceptor)];
}
