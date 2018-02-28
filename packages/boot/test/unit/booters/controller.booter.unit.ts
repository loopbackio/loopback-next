// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, TestSandbox} from '@loopback/testlab';
import {Application} from '@loopback/core';
import {ControllerBooter, ControllerDefaults} from '../../../index';
import {resolve} from 'path';

describe('controller booter unit tests', () => {
  const SANDBOX_PATH = resolve(__dirname, '../../../.sandbox');
  const sandbox = new TestSandbox(SANDBOX_PATH);

  const CONTROLLERS_PREFIX = 'controllers';
  const CONTROLLERS_TAG = 'controller';

  let app: Application;

  beforeEach(resetSandbox);
  beforeEach(getApp);

  it(`constructor uses ControllerDefaults for 'options' if none are given`, () => {
    const booterInst = new ControllerBooter(app, SANDBOX_PATH);
    expect(booterInst.options).to.deepEqual(ControllerDefaults);
  });

  it('overrides defaults with provided options and uses defaults for rest', () => {
    const options = {
      dirs: ['test', 'test2'],
      extensions: ['.ext1', 'ext2'],
    };
    const expected = Object.assign({}, options, {
      nested: ControllerDefaults.nested,
    });

    const booterInst = new ControllerBooter(app, SANDBOX_PATH, options);
    expect(booterInst.options).to.deepEqual(expected);
  });

  it('binds controllers during load phase', async () => {
    const expected = [
      `${CONTROLLERS_PREFIX}.ArtifactOne`,
      `${CONTROLLERS_PREFIX}.ArtifactTwo`,
    ];
    await sandbox.copyFile(
      resolve(__dirname, '../../fixtures/multiple.artifact.js'),
    );
    const booterInst = new ControllerBooter(app, SANDBOX_PATH);
    const NUM_CLASSES = 2; // 2 classes in above file.

    // Load uses discovered property
    booterInst.discovered = [resolve(SANDBOX_PATH, 'multiple.artifact.js')];
    await booterInst.load();

    const ctrls = app.findByTag(CONTROLLERS_TAG);
    const keys = ctrls.map(binding => binding.key);
    expect(keys).to.have.lengthOf(NUM_CLASSES);
    expect(keys.sort()).to.eql(expected.sort());
  });

  function getApp() {
    app = new Application();
  }

  async function resetSandbox() {
    await sandbox.reset();
  }
});
