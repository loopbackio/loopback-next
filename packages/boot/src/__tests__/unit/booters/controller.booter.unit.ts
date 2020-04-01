// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from '@loopback/core';
import {expect, TestSandbox} from '@loopback/testlab';
import {resolve} from 'path';
import {ControllerBooter, ControllerDefaults} from '../../..';

describe('controller booter unit tests', () => {
  const sandbox = new TestSandbox(resolve(__dirname, '../../../.sandbox'));

  const CONTROLLERS_PREFIX = 'controllers';
  const CONTROLLERS_TAG = 'controller';

  let app: Application;

  beforeEach('reset sandbox', () => sandbox.reset());
  beforeEach(getApp);

  it(`constructor uses ControllerDefaults for 'options' if none are given`, () => {
    const booterInst = new ControllerBooter(app, sandbox.path);
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

    const booterInst = new ControllerBooter(app, sandbox.path, options);
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
    const booterInst = new ControllerBooter(app, sandbox.path);
    const NUM_CLASSES = 2; // 2 classes in above file.

    // Load uses discovered property
    booterInst.discovered = [resolve(sandbox.path, 'multiple.artifact.js')];
    await booterInst.load();

    const ctrls = app.findByTag(CONTROLLERS_TAG);
    const keys = ctrls.map(binding => binding.key);
    expect(keys).to.have.lengthOf(NUM_CLASSES);
    expect(keys.sort()).to.eql(expected.sort());
  });

  function getApp() {
    app = new Application();
  }
});
