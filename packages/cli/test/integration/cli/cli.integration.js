// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const expect = require('@loopback/testlab').expect;
const util = require('util');
const main = require('../../../lib/cli');
const {expectToMatchSnapshot} = require('../../snapshots');

function getLog(buffer) {
  buffer = buffer || [];
  return function(format, ...params) {
    buffer.push(util.format(format, ...params));
    return buffer;
  };
}

describe('cli', () => {
  it('lists available commands', () => {
    const entries = [];
    main({commands: true}, getLog(entries));
    expectToMatchSnapshot(entries.join('\n'));
  });

  it('lists versions', () => {
    const entries = [];
    main({version: true}, getLog(entries));
    const logs = entries.join('');
    expect(logs).to.match(/@loopback\/cli version\:/);
    expect(logs).to.match(/@loopback\/\* dependencies:/);
  });

  it('prints commands with --help', () => {
    const entries = [];
    main({help: true, _: []}, getLog(entries), true);
    expectToMatchSnapshot(entries.join('\n'));
  });

  it('does not print commands with --help for a given command', () => {
    const entries = [];
    main({help: true, _: ['app']}, getLog(entries), true);
    expect(entries).to.not.containEql('Available commands:');
  });
});
