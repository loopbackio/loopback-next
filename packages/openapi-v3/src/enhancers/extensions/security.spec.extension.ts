// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {bind} from '@loopback/core';
import debugModule from 'debug';
import {inspect} from 'util';
import {mergeOpenAPISpec, ReferenceObject, SecuritySchemeObject} from '../..';
import {OpenApiSpec} from '../../types';
import {asSpecEnhancer, OASEnhancer} from '../types';
const debug = debugModule('loopback:openapi:spec-enhancer');

export type SecuritySchemeObjects = {
  [securityScheme: string]: SecuritySchemeObject | ReferenceObject;
};

export const SECURITY_SCHEME_SPEC: SecuritySchemeObjects = {
  jwt: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  },
};

/**
 * A spec enhancer to add jwt bearer token OpenAPI security entry to
 * `spec.component.securitySchemes`
 */
@bind(asSpecEnhancer)
export class SecuritySpecEnhancer implements OASEnhancer {
  name = 'security';

  modifySpec(spec: OpenApiSpec): OpenApiSpec {
    if (spec?.components?.securitySchemes?.jwt) return spec;
    const patchSpec = {
      components: {securitySchemes: SECURITY_SCHEME_SPEC},
    };
    const mergedSpec = mergeOpenAPISpec(spec, patchSpec);
    debug(`security spec extension, merged spec: ${inspect(mergedSpec)}`);
    return mergedSpec;
  }
}
