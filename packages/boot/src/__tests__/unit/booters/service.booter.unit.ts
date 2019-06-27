// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from '@loopback/core';
import {ApplicationWithServices, ServiceMixin} from '@loopback/service-proxy';
import {expect, sinon, TestSandbox} from '@loopback/testlab';
import {resolve} from 'path';
import {ServiceBooter, ServiceDefaults} from '../../..';

describe('service booter unit tests', () => {
  const SANDBOX_PATH = resolve(__dirname, '../../../.sandbox');
  const sandbox = new TestSandbox(SANDBOX_PATH);

  const SERVICES_PREFIX = 'services';
  const SERVICES_TAG = 'service';

  class AppWithRepo extends ServiceMixin(Application) {}

  let app: AppWithRepo;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let stub: sinon.SinonStub<[any?, ...any[]], void>;

  beforeEach('reset sandbox', () => sandbox.reset());
  beforeEach(getApp);
  beforeEach(createStub);
  afterEach(restoreStub);

  it('does not require service mixin', async () => {
    const normalApp = new Application();
    await sandbox.copyFile(
      resolve(__dirname, '../../fixtures/service-provider.artifact.js'),
    );

    const booterInst = new ServiceBooter(
      normalApp as ApplicationWithServices,
      SANDBOX_PATH,
    );

    booterInst.discovered = [
      resolve(SANDBOX_PATH, 'service-provider.artifact.js'),
    ];
    await booterInst.load();

    sinon.assert.notCalled(stub);
  });

  it(`uses ServiceDefaults for 'options' if none are given`, () => {
    const booterInst = new ServiceBooter(app, SANDBOX_PATH);
    expect(booterInst.options).to.deepEqual(ServiceDefaults);
  });

  it('overrides defaults with provided options and uses defaults for the rest', () => {
    const options = {
      dirs: ['test'],
      extensions: ['.ext1'],
    };
    const expected = Object.assign({}, options, {
      nested: ServiceDefaults.nested,
    });

    const booterInst = new ServiceBooter(app, SANDBOX_PATH, options);
    expect(booterInst.options).to.deepEqual(expected);
  });

  it('binds services during the load phase', async () => {
    const expected = [`${SERVICES_PREFIX}.GeocoderService`];
    await sandbox.copyFile(
      resolve(__dirname, '../../fixtures/service-provider.artifact.js'),
    );
    const booterInst = new ServiceBooter(app, SANDBOX_PATH);
    const NUM_CLASSES = 1; // 1 class in above file.

    booterInst.discovered = [
      resolve(SANDBOX_PATH, 'service-provider.artifact.js'),
    ];
    await booterInst.load();

    const services = app.findByTag(SERVICES_TAG);
    const keys = services.map(binding => binding.key);
    expect(keys).to.have.lengthOf(NUM_CLASSES);
    expect(keys.sort()).to.eql(expected.sort());
  });

  function getApp() {
    app = new AppWithRepo();
  }

  function restoreStub() {
    stub.restore();
  }

  function createStub() {
    stub = sinon.stub(console, 'warn');
  }
});
