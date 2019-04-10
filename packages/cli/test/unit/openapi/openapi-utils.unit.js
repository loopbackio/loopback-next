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
});
