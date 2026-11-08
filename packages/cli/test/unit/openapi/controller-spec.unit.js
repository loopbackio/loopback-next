// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const json5 = require('json5');
const {loadAndBuildSpec} = require('../../../generators/openapi/spec-loader');
const path = require('path');
const {expectToMatchSnapshot} = require('../../snapshots');
const assert = require('assert');

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

describe('openapi to controllers with hyphenated parameters', () => {
  const hyphenSpec = path.join(
    __dirname,
    '../../fixtures/openapi/3.0/hyphenated-params.json',
  );

  it('generates correct parameter bindings for hyphenated names', async () => {
    const spec = await loadAndBuildSpec(hyphenSpec);
    const controllerSpecsString = json5.stringify(spec.controllerSpecs);

    assert(
      controllerSpecsString.includes('limitNumber'),
      'Expected controllerSpecsString to include limitNumber',
    );
    assert(
      controllerSpecsString.includes('statusCode'),
      'Expected controllerSpecsString to include statusCode',
    );
    assert(
      !controllerSpecsString.includes('limit-number,'),
      'Expected controllerSpecsString not to include raw limit-number',
    );
    assert(
      !controllerSpecsString.includes('status-code,'),
      'Expected controllerSpecsString not to include raw status-code',
    );
  });
});
