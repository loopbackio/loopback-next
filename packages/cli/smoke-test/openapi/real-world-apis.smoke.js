// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const {supertest} = require('@loopback/testlab');

const {
  createAppProject,
  generateOpenApiArtifacts,
  runLintFix,
  runNpmTest,
} = require('./code-gen-utils');

let realWorldAPIs = [
  {
    name: 'api2cart.com',
    version: '1.0.0',
    swaggerUrl:
      'https://api.apis.guru/v2/specs/api2cart.com/1.0.0/swagger.json',
  },
  {
    name: 'amazonaws.com/codecommit',
    version: '2015-04-13',
    swaggerUrl:
      'https://api.apis.guru/v2/specs/amazonaws.com/codecommit/2015-04-13/swagger.json',
  },
];

describe('Real-world APIs', () => {
  before(async function() {
    // Set env var `APIS` to `*` to test against apis.guru directory
    if (process.env.APIS !== 'all') return;

    if (typeof process.env.APIS === 'string') {
      realWorldAPIs = process.env.APIS.split(/\s+/)
        .filter(Boolean)
        .map(url => ({
          swaggerUrl: url,
          name: '',
          version: '',
        }));
      return;
    }

    // This hook sometimes takes several seconds, due to the large download
    // eslint-disable-next-line no-invalid-this
    this.timeout(10000);

    // Download a list of over 1500 real-world Swagger APIs from apis.guru
    const res = await supertest('https://api.apis.guru')
      .get('/v2/list.json')
      .expect(200);
    if (!res.ok) {
      throw new Error('Unable to download API listing from apis.guru');
    }

    // Remove certain APIs that are known to cause problems
    const apis = res.body;

    // GitHub's CORS policy blocks this request
    delete apis['googleapis.com:adsense'];

    // These APIs cause infinite loops in json-schema-ref-parser.  Still investigating.
    // https://github.com/BigstickCarpet/json-schema-ref-parser/issues/56
    delete apis['bungie.net'];
    delete apis['stripe.com'];

    // Flatten the list, so there's an API object for every API version
    realWorldAPIs = [];
    for (const apiName in apis) {
      for (const version in apis[apiName].versions) {
        const api = apis[apiName].versions[version];
        api.name = apiName;
        api.version = version;
        realWorldAPIs.push(api);
      }
    }
  });

  it('generates all the proper files', async function() {
    // eslint-disable-next-line no-invalid-this
    this.timeout(0);
    let count = 0;
    for (const api of realWorldAPIs) {
      console.log('Testing %s', api.swaggerUrl);
      const sandbox = await createAppProject('openapi-test-' + count++);
      console.log('Sandbox app created: %s', sandbox);
      await generateOpenApiArtifacts(sandbox, api.swaggerUrl);
      console.log('OpenApi artifacts generated');
      await runLintFix(sandbox);
      console.log('Artifacts formatted with prettier');
      await runNpmTest(sandbox);
      console.log('npm test is passing', sandbox);
      // await cleanSandbox(sandbox);
    }
  });
});
