// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, createBindingFromClass} from '@loopback/core';
import {OASEnhancerService, OAS_ENHANCER_SERVICE} from '../../../..';
import {SecuritySpecEnhancer} from '../../../../enhancers/extensions/security.spec.extension';
import {InfoSpecEnhancer} from './info.spec.extension';

export class SpecServiceApplication extends Application {
  constructor() {
    super();
    this.add(
      createBindingFromClass(OASEnhancerService, {
        key: OAS_ENHANCER_SERVICE,
      }),
    );
    this.add(createBindingFromClass(SecuritySpecEnhancer));
    this.add(createBindingFromClass(InfoSpecEnhancer));
  }

  async main() {}

  getSpecService() {
    return this.get(OAS_ENHANCER_SERVICE);
  }
}
