// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const {
  canImportModelName,
} = require('../../../generators/import-lb3-models/model-names');
const {expect} = require('@loopback/testlab');

describe('canImportModelName', () => {
  ['Model', 'PersistedModel', 'KeyValueModel'].forEach(name => {
    it(`rejects base model ${name}`, () => {
      expect(canImportModelName(name)).to.equal(false);
    });
  });

  ['Change', 'Checkpoint'].forEach(name => {
    it(`rejects change-tracking model ${name}`, () => {
      expect(canImportModelName(name)).to.equal(false);
    });
  });

  it('rejects model Email', () => {
    expect(canImportModelName('Email')).to.equal(false);
  });

  it('rejects anonymous models', () => {
    expect(canImportModelName('AnonymousModel_0')).to.equal(false);
  });

  [
    'ACL',
    'AccessToken',
    'Application',
    'Role',
    'RoleMapping',
    'Scope',
    'User',
  ].forEach(name => {
    it(`allows built-in model ${name}`, () => {
      expect(canImportModelName(name)).to.equal(true);
    });
  });

  ['Product', 'Category', 'CoffeeShop', 'Customer'].forEach(name => {
    it(`allows application-specific model name ${name}`, () => {
      expect(canImportModelName('Product')).to.equal(true);
    });
  });
});
