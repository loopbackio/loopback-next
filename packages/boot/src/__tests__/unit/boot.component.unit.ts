// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {
  BootBindings,
  BootMixin,
  Bootstrapper,
  ControllerBooter,
  ServiceBooter,
} from '../../';

describe('boot.component unit tests', () => {
  class BootableApp extends BootMixin(Application) {}

  let app: BootableApp;

  beforeEach(getApp);

  it('binds BootStrapper class', async () => {
    const bootstrapper = await app.get(BootBindings.BOOTSTRAPPER_KEY);
    expect(bootstrapper).to.be.an.instanceOf(Bootstrapper);
  });

  it('ControllerBooter is bound as a booter by default', async () => {
    const booterInst = await app.get(
      `${BootBindings.BOOTERS}.ControllerBooter`,
    );
    expect(booterInst).to.be.an.instanceOf(ControllerBooter);
  });

  it('ServiceBooter is bound as a booter by default', async () => {
    const booterInst = await app.get(`${BootBindings.BOOTERS}.ServiceBooter`);
    expect(booterInst).to.be.an.instanceOf(ServiceBooter);
  });

  function getApp() {
    app = new BootableApp();
    app.bind(BootBindings.PROJECT_ROOT).to(__dirname);
  }
});
