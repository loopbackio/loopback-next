// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/core';
import {OASEnhancerService} from './spec-enhancer.service';

/**
 * Strongly-typed binding key for SpecService
 */
export const OAS_ENHANCER_SERVICE = BindingKey.create<OASEnhancerService>(
  'services.SpecService',
);
