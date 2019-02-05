// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {BootMixin, Booter, BootBindings} from '../../..';
import {Application} from '@loopback/core';

describe('BootMxiin unit tests', () => {
  let app: AppWithBootMixin;

  beforeEach(getApp);

  it('mixes into the target class', () => {
    expect(app.boot).to.be.a.Function();
    expect(app.booters).to.be.a.Function();
  });

  it('adds BootComponent to target class', () => {
    const boundComponent = app.find('components.*').map(b => b.key);
    expect(boundComponent).to.containEql('components.BootComponent');
  });

  it('binds booter from app.booters()', async () => {
    app.booters(TestBooter);
    const booter = await app.get(`${BootBindings.BOOTER_PREFIX}.TestBooter`);
    expect(booter).to.be.an.instanceOf(TestBooter);
  });

  it('binds multiple booter classes from app.booters()', async () => {
    app.booters(TestBooter, AnotherTestBooter);
    const booter = await app.get(`${BootBindings.BOOTER_PREFIX}.TestBooter`);
    expect(booter).to.be.an.instanceOf(TestBooter);

    const anotherBooter = await app.get(
      `${BootBindings.BOOTER_PREFIX}.AnotherTestBooter`,
    );
    expect(anotherBooter).to.be.an.instanceOf(AnotherTestBooter);
  });

  it('binds user defined component without a booter', async () => {
    class EmptyTestComponent {}

    app.component(EmptyTestComponent);
    const compInstance = await app.get('components.EmptyTestComponent');
    expect(compInstance).to.be.an.instanceOf(EmptyTestComponent);
  });

  it('binds a user defined component with a booter from .component()', async () => {
    class TestComponent {
      booters = [TestBooter];
    }

    app.component(TestComponent);
    const compInstance = await app.get('components.TestComponent');
    expect(compInstance).to.be.an.instanceOf(TestComponent);
    const booterInst = await app.get(
      `${BootBindings.BOOTER_PREFIX}.TestBooter`,
    );
    expect(booterInst).to.be.an.instanceOf(TestBooter);
  });

  class TestBooter implements Booter {
    configured = false;

    async configure() {
      this.configured = true;
    }
  }

  class AnotherTestBooter implements Booter {
    discovered = false;

    async discover() {
      this.discovered = true;
    }
  }

  class AppWithBootMixin extends BootMixin(Application) {}

  function getApp() {
    app = new AppWithBootMixin();
  }
});
