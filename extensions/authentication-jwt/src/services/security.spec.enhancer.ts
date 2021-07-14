import {injectable} from '@loopback/core';
// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authentication-jwt"
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
import {
  asSpecEnhancer,
  mergeOpenAPISpec,
  OASEnhancer,
  OpenApiSpec,
  ReferenceObject,
  SecuritySchemeObject,
} from '@loopback/rest';
import debugModule from 'debug';
import {inspect} from 'util';
const debug = debugModule('loopback:jwt-extension:spec-enhancer');

export type SecuritySchemeObjects = {
  [securityScheme: string]: SecuritySchemeObject | ReferenceObject;
};

export const OPERATION_SECURITY_SPEC = [
  {
    // secure all endpoints with 'jwt'
    jwt: [],
  },
];

export const SECURITY_SCHEME_SPEC: SecuritySchemeObjects = {
  jwt: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  },
};

/**
 * A spec enhancer to add bearer token OpenAPI security entry to
 * `spec.component.securitySchemes`
 */
@injectable(asSpecEnhancer)
export class SecuritySpecEnhancer implements OASEnhancer {
  name = 'bearerAuth';

  modifySpec(spec: OpenApiSpec): OpenApiSpec {
    const patchSpec = {
      components: {
        securitySchemes: SECURITY_SCHEME_SPEC,
      },
      security: OPERATION_SECURITY_SPEC,
    };
    const mergedSpec = mergeOpenAPISpec(spec, patchSpec);
    debug(`security spec extension, merged spec: ${inspect(mergedSpec)}`);
    return mergedSpec;
  }
}
