// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/apiconnect
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {bind, config} from '@loopback/core';
import {asSpecEnhancer, OASEnhancer, OpenAPIObject} from '@loopback/openapi-v3';

/**
 * Configuration for IBM API Connect extensions to the OpenAPI spec
 */
export type ApiConnectSpecOptions = {
  targetUrl: string;
};

/**
 * An OpenAPI spec enhancer to add `x-ibm-configuration` extension required
 * by API Connect
 */
@bind(asSpecEnhancer)
export class ApiConnectSpecEnhancer implements OASEnhancer {
  name = 'IBM API Connect';

  constructor(
    @config({optional: false}) private options: ApiConnectSpecOptions,
  ) {}

  modifySpec(spec: OpenAPIObject): OpenAPIObject {
    spec['x-ibm-configuration'] = {
      assembly: {
        execute: [
          {
            invoke: {
              title: 'invoke',
              version: '2.0.0',
              'target-url': this.options.targetUrl,
            },
          },
        ],
      },
      cors: {
        enabled: true,
      },
      enforced: true,
      phase: 'realized',
      testable: true,
      gateway: 'datapower-api-gateway',
    };
    return spec;
  }
}
