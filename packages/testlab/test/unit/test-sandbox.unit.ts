// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {TestSandbox, expect, sinon} from '../..';
import * as fs from 'fs';
import {resolve} from 'path';

describe('TestSandbox unit tests', () => {
  const sandboxPath = resolve(__dirname, 'sandbox');
  let sandbox: TestSandbox;
  let mkdirSyncSpy: sinon.SinonSpy;

  beforeEach(createSpies);
  beforeEach(createSandbox);
  afterEach(restoreSpies);

  it('created a sandbox using mkdirSync', () => {
    sinon.assert.calledWith(mkdirSyncSpy, sandboxPath);
  });

  function createSandbox() {
    sandbox = new TestSandbox(sandboxPath);
  }

  function createSpies() {
    mkdirSyncSpy = sinon.spy(fs, 'mkdirSync');
  }

  function restoreSpies() {
    mkdirSyncSpy.restore();
  }
});
