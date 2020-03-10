// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/apiconnect
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/core';
import {ApiConnectSpecEnhancer} from './apiconnect.spec-enhancer';

export namespace ApiConnectBindings {
  /**
   * Strongly-typed binding key for ApiConnectSpecEnhancer
   */
  export const API_CONNECT_SPEC_ENHANCER = BindingKey.create<
    ApiConnectSpecEnhancer
  >('oas-enhancer.ApiConnectSpecEnhancer');
}
