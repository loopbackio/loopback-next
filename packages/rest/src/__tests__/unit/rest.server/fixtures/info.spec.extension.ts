// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {bind} from '@loopback/core';
import debugFactory from 'debug';
import {inspect} from 'util';
import {
  asSpecEnhancer,
  mergeOpenAPISpec,
  OASEnhancer,
  OpenApiSpec,
} from '../../../..';

const debug = debugFactory('loopback:openapi:spec-enhancer');

/**
 * A spec enhancer to add OpenAPI info spec
 */
@bind(asSpecEnhancer)
export class TestInfoSpecEnhancer implements OASEnhancer {
  name = 'info-test';

  modifySpec(spec: OpenApiSpec): OpenApiSpec {
    const InfoPatchSpec = {
      info: {title: 'LoopBack Test Application', version: '1.0.1'},
    };
    const mergedSpec = mergeOpenAPISpec(spec, InfoPatchSpec);
    debug(`security spec extension, merged spec: ${inspect(mergedSpec)}`);
    return mergedSpec;
  }
}
