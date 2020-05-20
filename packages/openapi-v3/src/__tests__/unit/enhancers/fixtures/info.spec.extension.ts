// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {bind} from '@loopback/core';
import debugModule from 'debug';
import {inspect} from 'util';
import {
  asSpecEnhancer,
  mergeOpenAPISpec,
  OASEnhancer,
  OpenApiSpec,
} from '../../../..';
const debug = debugModule('loopback:openapi:spec-enhancer');

/**
 * A spec enhancer to add OpenAPI info spec
 */
@bind(asSpecEnhancer)
export class InfoSpecEnhancer implements OASEnhancer {
  name = 'info';

  modifySpec(spec: OpenApiSpec): OpenApiSpec {
    const InfoPatchSpec = {
      info: {title: 'LoopBack Test Application', version: '1.0.1'},
    };
    const mergedSpec = mergeOpenAPISpec(spec, InfoPatchSpec);
    debug(`Info spec extension, merged spec: ${inspect(mergedSpec)}`);
    return mergedSpec;
  }
}
