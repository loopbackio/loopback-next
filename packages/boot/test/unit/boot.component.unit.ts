// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Application} from '@loopback/core';
import {
  BootBindings,
  Bootstrapper,
  ControllerBooter,
  BootMixin,
  RepositoryBooter,
  DataSourceBooter,
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
      `${BootBindings.BOOTER_PREFIX}.ControllerBooter`,
    );
    expect(booterInst).to.be.an.instanceOf(ControllerBooter);
  });

  it('RepositoryBooter is bound as a booter by default', async () => {
    const booterInst = await app.get(
      `${BootBindings.BOOTER_PREFIX}.RepositoryBooter`,
    );
    expect(booterInst).to.be.an.instanceOf(RepositoryBooter);
  });

  it('DataSourceBooter is bound as a booter by default', async () => {
    const booterInst = await app.get(
      `${BootBindings.BOOTER_PREFIX}.DataSourceBooter`,
    );
    expect(booterInst).to.be.an.instanceOf(DataSourceBooter);
  });

  it('ServiceBooter is bound as a booter by default', async () => {
    const booterInst = await app.get(
      `${BootBindings.BOOTER_PREFIX}.ServiceBooter`,
    );
    expect(booterInst).to.be.an.instanceOf(ServiceBooter);
  });

  function getApp() {
    app = new BootableApp();
    app.bind(BootBindings.PROJECT_ROOT).to(__dirname);
  }
});
