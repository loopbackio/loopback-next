// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/apiconnect
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Component, createBindingFromClass} from '@loopback/core';
import {ApiConnectSpecEnhancer} from './apiconnect.spec-enhancer';

export class ApiConnectComponent implements Component {
  bindings = [createBindingFromClass(ApiConnectSpecEnhancer)];
}
