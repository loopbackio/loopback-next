// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Application, CoreBindings} from '@loopback/core';
import {
  BootComponent,
  BootBindings,
  Bootstrapper,
  ControllerBooter,
} from '../../index';

describe('boot.component unit tests', () => {
  let app: Application;

  beforeEach(getApp);

  it('binds BootStrapper class', async () => {
    const bootstrapper = await app.get(CoreBindings.BOOTSTRAPPER);
    expect(bootstrapper).to.be.an.instanceOf(Bootstrapper);
  });

  it('ControllerBooter is bound as a booter by default', async () => {
    app.bind(BootBindings.BOOT_OPTIONS).to({projectRoot: __dirname});
    const ctrlBooter = await app.get(
      `${CoreBindings.BOOTER_PREFIX}.ControllerBooter`,
    );
    expect(ctrlBooter).to.be.an.instanceOf(ControllerBooter);
  });

  function getApp() {
    app = new Application();
    app.component(BootComponent);
  }
});
