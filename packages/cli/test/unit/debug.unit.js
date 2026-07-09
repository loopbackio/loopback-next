// Copyright IBM Corp. and LoopBack contributors 2018,2026. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const {expect} = require('@loopback/testlab');
const debugFactory = require('../../lib/debug');

describe('debug unit tests', () => {
  it('returns a debug function', () => {
    const debug = debugFactory('test');
    expect(debug).to.be.a.Function();
  });

  it('creates debug function with correct namespace', () => {
    const debug = debugFactory('test-scope');
    expect(debug.namespace).to.equal('loopback:cli:test-scope');
  });

  it('creates debug function without scope', () => {
    const debug = debugFactory();
    expect(debug.namespace).to.equal('loopback:cli');
  });

  it('extends the base namespace with provided scope', () => {
    const debug1 = debugFactory('scope1');
    const debug2 = debugFactory('scope2');
    expect(debug1.namespace).to.equal('loopback:cli:scope1');
    expect(debug2.namespace).to.equal('loopback:cli:scope2');
  });

  it('handles empty string scope', () => {
    const debug = debugFactory('');
    expect(debug.namespace).to.equal('loopback:cli:');
  });

  it('handles special characters in scope', () => {
    const debug = debugFactory('test:sub-scope');
    expect(debug.namespace).to.equal('loopback:cli:test:sub-scope');
  });
});

// Made with Bob
