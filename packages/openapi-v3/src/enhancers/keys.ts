// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/core';
import {OASEnhancerService} from './spec-enhancer.service';

export namespace OASEnhancerBindings {
  /**
   * Strongly-typed binding key for SpecService
   */
  export const OAS_ENHANCER_SERVICE = BindingKey.create<OASEnhancerService>(
    'services.SpecService',
  );

  /**
   * Name/id of the OAS enhancer extension point
   */
  export const OAS_ENHANCER_EXTENSION_POINT_NAME = 'oas-enhancer';
}
