// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  BindingScope,
  ContextTags,
  GLOBAL_INTERCEPTOR_NAMESPACE,
} from '@loopback/core';
import {expect, TestSandbox} from '@loopback/testlab';
import {resolve} from 'path';
import {BooterApp} from '../fixtures/application';

describe('interceptor script booter integration tests', () => {
  const SANDBOX_PATH = resolve(__dirname, '../../.sandbox');
  const sandbox = new TestSandbox(SANDBOX_PATH);

  let app: BooterApp;

  beforeEach('reset sandbox', () => sandbox.reset());
  beforeEach(buildAppWithInterceptors);

  it('boots global interceptors when app.boot() is called', async () => {
    const expectedBinding = {
      key: `${GLOBAL_INTERCEPTOR_NAMESPACE}.myGlobalInterceptor`,
      tags: [
        ContextTags.PROVIDER,
        ContextTags.TYPE,
        ContextTags.GLOBAL_INTERCEPTOR,
        ContextTags.NAMESPACE,
        ContextTags.GLOBAL_INTERCEPTOR_GROUP,
        ContextTags.NAME,
      ],
      scope: BindingScope.TRANSIENT,
    };

    await app.boot();

    const bindings = app
      .findByTag(ContextTags.GLOBAL_INTERCEPTOR)
      .map(b => ({key: b.key, tags: b.tagNames, scope: b.scope}));
    expect(bindings).to.containEql(expectedBinding);
  });

  it('boots non-global interceptors when app.boot() is called', async () => {
    const expectedBinding = {
      key: `interceptors.myInterceptor`,
      tags: [
        ContextTags.PROVIDER,
        ContextTags.TYPE,
        ContextTags.NAMESPACE,
        ContextTags.NAME,
      ],
      scope: BindingScope.TRANSIENT,
    };

    await app.boot();

    const binding = app.getBinding('interceptors.myInterceptor');
    expect({
      key: binding.key,
      tags: binding.tagNames,
      scope: binding.scope,
    }).to.eql(expectedBinding);
  });

  async function buildAppWithInterceptors() {
    await sandbox.copyFile(resolve(__dirname, '../fixtures/application.js'));
    await sandbox.copyFile(
      resolve(__dirname, '../fixtures/interceptor.artifact.js'),
      'interceptors/interceptor.interceptor.js',
    );
    await sandbox.copyFile(
      resolve(__dirname, '../fixtures/non-global-interceptor.artifact.js'),
      'interceptors/non-global-interceptor.interceptor.js',
    );

    const MyApp = require(resolve(SANDBOX_PATH, 'application.js')).BooterApp;
    app = new MyApp();
  }
});
