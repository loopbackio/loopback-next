// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/apiconnect
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  ApplicationMetadata,
  config,
  CoreBindings,
  inject,
  injectable,
} from '@loopback/core';
import {asSpecEnhancer, OASEnhancer, OpenAPIObject} from '@loopback/rest';
import {APIConnectOASObjects} from './types';

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
@injectable(asSpecEnhancer)
export class ApiConnectSpecEnhancer implements OASEnhancer {
  name = 'IBM API Connect';

  constructor(
    @config({optional: false}) private options: ApiConnectSpecOptions,
    @inject(CoreBindings.APPLICATION_METADATA, {optional: true})
    private appMetadata: ApplicationMetadata = {
      name: 'LoopBack Application',
      version: '1.0.0',
      description: 'LoopBack 4 Application',
    },
  ) {}

  modifySpec(spec: OpenAPIObject): APIConnectOASObjects.OpenAPIObject {
    const modifiedSpec: APIConnectOASObjects.OpenAPIObject = {
      ...spec,
      info: {
        ...spec.info,
        'x-ibm-name': this.appMetadata.name,
      },
      'x-ibm-configuration': {
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
      },
    };

    return modifiedSpec;
  }
}
