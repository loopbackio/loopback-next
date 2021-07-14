// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/apiconnect
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, CoreBindings} from '@loopback/core';
import {RestApplication, RestServer} from '@loopback/rest';
import {expect} from '@loopback/testlab';
import {
  ApiConnectBindings,
  ApiConnectComponent,
  ApiConnectSpecOptions,
} from '../..';

describe('Extension for IBM API Connect - OASEnhancer', () => {
  let app: Application;
  let server: RestServer;
  beforeEach(givenAServer);

  it('adds x-ibm-configuration to apiSpec', async () => {
    const EXPECTED_SPEC = {
      'x-ibm-configuration': {
        assembly: {
          execute: [
            {
              invoke: {
                title: 'invoke',
                version: '2.0.0',
                'target-url': 'http://localhost:3000/test-service',
              },
            },
          ],
        },
        cors: {enabled: true},
        enforced: true,
        phase: 'realized',
        testable: true,
        gateway: 'datapower-api-gateway',
      },
    };
    const spec = await server.getApiSpec();
    expect(spec).to.containDeep(EXPECTED_SPEC);
  });

  it('adds x-ibm-name to apiSpec info', async () => {
    app.setMetadata({name: 'lb4-app', version: '1.0.0', description: ''});
    const EXPECTED_SPEC = {
      info: {
        'x-ibm-name': 'lb4-app',
      },
    };
    const spec = await server.getApiSpec();
    expect(spec).to.containDeep(EXPECTED_SPEC);
  });

  it('adds default x-ibm-name to apiSpec info', async () => {
    app.unbind(CoreBindings.APPLICATION_METADATA);
    const EXPECTED_SPEC = {
      info: {
        'x-ibm-name': 'LoopBack Application',
      },
    };
    const spec = await server.getApiSpec();
    expect(spec).to.containDeep(EXPECTED_SPEC);
  });

  async function givenAServer() {
    app = new RestApplication();
    app.component(ApiConnectComponent);
    const apiConnectOptions: ApiConnectSpecOptions = {
      targetUrl: 'http://localhost:3000/test-service',
    };
    app
      .configure(ApiConnectBindings.API_CONNECT_SPEC_ENHANCER)
      .to(apiConnectOptions);
    server = await app.getServer(RestServer);
  }
});
