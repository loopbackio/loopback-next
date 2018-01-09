// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const promisify = require('../lib/promisify');

const cloneExampleFromGitHub = require('../generators/example/clone-example');
const expect = require('@loopback/testlab').expect;
const fs = require('fs');
const glob = promisify(require('glob'));
const path = require('path');
const rimraf = promisify(require('rimraf'));

const VALID_EXAMPLE = 'codehub';
const SANDBOX = path.resolve(__dirname, 'sandbox');

describe('cloneExampleFromGitHub', function() {
  this.timeout(10000);

  beforeEach(resetSandbox);

  it('extracts all project files', () => {
    return cloneExampleFromGitHub(VALID_EXAMPLE, SANDBOX)
      .then(outDir => {
        return Promise.all([
          glob('**', {
            cwd: path.join(__dirname, `../../example-${VALID_EXAMPLE}`),
            ignore: 'node_modules/**',
          }),
          glob('**', {
            cwd: outDir,
            ignore: 'node_modules/**',
          }),
        ]);
      })
      .then(found => {
        const [expected, actual] = found;
        expect(actual).to.deepEqual(expected);
      });
  });

  function resetSandbox() {
    return rimraf(SANDBOX);
  }
});
