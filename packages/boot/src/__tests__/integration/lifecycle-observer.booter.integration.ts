// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  BindingScope,
  ContextTags,
  CoreBindings,
  CoreTags,
} from '@loopback/core';
import {expect, TestSandbox} from '@loopback/testlab';
import {resolve} from 'path';
import {BooterApp} from '../fixtures/application';

describe('lifecycle script booter integration tests', () => {
  const SANDBOX_PATH = resolve(__dirname, '../../.sandbox');
  const sandbox = new TestSandbox(SANDBOX_PATH);

  const OBSERVER_PREFIX = CoreBindings.LIFE_CYCLE_OBSERVERS;
  const OBSERVER_TAG = CoreTags.LIFE_CYCLE_OBSERVER;

  let app: BooterApp;

  beforeEach('reset sandbox', () => sandbox.reset());
  beforeEach(getApp);

  it('boots life cycle observers when app.boot() is called', async () => {
    const expectedBinding = {
      key: `${OBSERVER_PREFIX}.MyLifeCycleObserver`,
      tags: [ContextTags.TYPE, OBSERVER_TAG],
      scope: BindingScope.SINGLETON,
    };

    await app.boot();

    const bindings = app
      .findByTag(OBSERVER_TAG)
      .map(b => ({key: b.key, tags: b.tagNames, scope: b.scope}));
    expect(bindings).to.containEql(expectedBinding);
  });

  async function getApp() {
    await sandbox.copyFile(resolve(__dirname, '../fixtures/application.js'));
    await sandbox.copyFile(
      resolve(__dirname, '../fixtures/lifecycle-observer.artifact.js'),
      'observers/lifecycle-observer.observer.js',
    );

    const MyApp = require(resolve(SANDBOX_PATH, 'application.js')).BooterApp;
    app = new MyApp();
  }
});
