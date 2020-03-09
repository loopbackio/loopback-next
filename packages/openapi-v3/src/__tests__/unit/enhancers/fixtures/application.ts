// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, createBindingFromClass} from '@loopback/core';
import {OASEnhancerBindings, OASEnhancerService} from '../../../..';
import {InfoSpecEnhancer} from './info.spec.extension';
import {SecuritySpecEnhancer} from './security.spec.extension';

export class SpecServiceApplication extends Application {
  constructor() {
    super();
    this.add(
      createBindingFromClass(OASEnhancerService, {
        key: OASEnhancerBindings.OAS_ENHANCER_SERVICE,
      }),
    );
    this.add(createBindingFromClass(SecuritySpecEnhancer));
    this.add(createBindingFromClass(InfoSpecEnhancer));
  }

  async main() {}

  getSpecService() {
    return this.get(OASEnhancerBindings.OAS_ENHANCER_SERVICE);
  }
}
