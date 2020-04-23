// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const json5 = require('json5');
const {loadAndBuildSpec} = require('../../../generators/openapi/spec-loader');
const path = require('path');

const {expectToMatchSnapshot} = require('../../snapshots');

describe('openapi to controllers/models', () => {
  const customer = path.join(
    __dirname,
    '../../fixtures/openapi/3.0/customer.yaml',
  );

  it('generates models for customer', async () => {
    const customerSpec = await loadAndBuildSpec(customer);
    expectToMatchSnapshot(
      json5.stringify(customerSpec.controllerSpecs),
      null,
      2,
    );
  });
});
