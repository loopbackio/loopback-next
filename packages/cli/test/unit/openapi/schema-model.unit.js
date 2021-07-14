// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const {
  loadSpec,
  loadAndBuildSpec,
} = require('../../../generators/openapi/spec-loader');
const {
  generateModelSpecs,
} = require('../../../generators/openapi/schema-helper');
const path = require('path');
const json5 = require('json5');
const {expectToMatchSnapshot} = require('../../snapshots');

describe('schema to model', () => {
  let usptoSpec, usptoSpecAnonymous, petstoreSpec, customerSpec;
  const uspto = path.join(__dirname, '../../fixtures/openapi/3.0/uspto.yaml');
  const petstore = path.join(
    __dirname,
    '../../fixtures/openapi/3.0/petstore-expanded.yaml',
  );
  const customer = path.join(
    __dirname,
    '../../fixtures/openapi/3.0/customer.yaml',
  );

  before(async () => {
    usptoSpec = await loadSpec(uspto);
    usptoSpecAnonymous = await loadAndBuildSpec(uspto, {
      promoteAnonymousSchemas: true,
    });
    petstoreSpec = await loadSpec(petstore);
    customerSpec = await loadSpec(customer);
  });

  it('generates models for uspto', () => {
    const objectTypeMapping = new Map();
    const models = generateModelSpecs(usptoSpec, {objectTypeMapping});
    expectToMatchSnapshot(json5.stringify(models), null, 2);
  });

  it('generates models for uspto with promoted anonymous schemas', () => {
    const models = usptoSpecAnonymous.modelSpecs;
    expectToMatchSnapshot(json5.stringify(models), null, 2);
  });

  it('generates models for petstore', () => {
    const objectTypeMapping = new Map();
    const models = generateModelSpecs(petstoreSpec, {objectTypeMapping});
    expectToMatchSnapshot(json5.stringify(models), null, 2);
  });

  it('generates models for customer', () => {
    const objectTypeMapping = new Map();
    const models = generateModelSpecs(customerSpec, {objectTypeMapping});
    expectToMatchSnapshot(json5.stringify(models), null, 2);
  });
});
