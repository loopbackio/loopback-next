// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const expect = require('@loopback/testlab').expect;
const util = require('util');
const path = require('path');
const main = require('../../../lib/cli');
const {
  expectToMatchSnapshot,
  expectFileToMatchSnapshot,
} = require('../../snapshots')();

function getLog(buffer) {
  buffer = buffer || [];
  return function (format, ...params) {
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
    main({help: true, dryRun: true, _: []}, getLog(entries));
    expectToMatchSnapshot(entries.join('\n'));
  });

  it('does not print commands with --help for a given command', () => {
    const entries = [];
    main({help: true, dryRun: true, _: ['app']}, getLog(entries));
    expect(entries).to.not.containEql('Available commands:');
  });

  it('saves command metadata to .yo-rc.json', () => {
    const entries = [];
    main({meta: true}, getLog(entries));
    const logs = entries.join('');
    expect(logs).to.match(/\.yo-rc\.json is up to date./);
    expectFileToMatchSnapshot(path.join(__dirname, '../../../.yo-rc.json'));
  });
});
