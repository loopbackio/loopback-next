// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const expect = require('@loopback/testlab').expect;
const utils = require('../../../generators/openapi/utils');

describe('openapi utils', () => {
  it('escapes keywords for an identifier', () => {
    expect(utils.escapeIdentifier('for')).to.eql('_for');
  });

  it('escapes an identifier conflicting with decorators for ', () => {
    expect(utils.escapeIdentifier('requestBody')).to.eql('_requestBody');
    expect(utils.escapeIdentifier('operation')).to.eql('_operation');
    expect(utils.escapeIdentifier('param')).to.eql('_param');
  });

  it('escapes illegal chars for an identifier', () => {
    expect(utils.escapeIdentifier('foo bar')).to.eql('fooBar');
    expect(utils.escapeIdentifier('foo-bar')).to.eql('fooBar');
    expect(utils.escapeIdentifier('foo.bar')).to.eql('fooBar');
  });

  it('does not escape legal chars for an identifier', () => {
    expect(utils.escapeIdentifier('foobar')).to.eql('foobar');
    expect(utils.escapeIdentifier('fooBar')).to.eql('fooBar');
    expect(utils.escapeIdentifier('Foobar')).to.eql('Foobar');
  });

  it('escapes property names with illegal chars', () => {
    expect(utils.escapePropertyName('customer-id')).to.eql("'customer-id'");
    expect(utils.escapePropertyName('customer id')).to.eql("'customer id'");
    expect(utils.escapePropertyName('customer.id')).to.eql("'customer.id'");
    expect(utils.escapePropertyName('default')).to.eql("'default'");
  });

  it('does not escape property names with legal chars', () => {
    expect(utils.escapePropertyName('customerId')).to.eql('customerId');
    expect(utils.escapePropertyName('customer_id')).to.eql('customer_id');
    expect(utils.escapePropertyName('customerid')).to.eql('customerid');
  });

  it('escapes chars for comments', () => {
    expect(utils.escapeComment('/* abc */')).to.eql('\\/* abc *\\/');
    expect(utils.escapeComment('/* abc')).to.eql('\\/* abc');
    expect(utils.escapeComment('abc */')).to.eql('abc *\\/');
    expect(utils.escapeComment('abc')).to.eql('abc');
  });
});
