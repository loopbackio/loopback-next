// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Application} from '@loopback/core';
import {Bootstrapper, Booter, BootBindings, BootMixin} from '../../index';
import {RepositoryMixin} from '@loopback/repository';

describe('boot-strapper unit tests', () => {
  // RepositoryMixin is added to avoid warning message printed logged to console
  // due to the fact that RepositoryBooter is a default Booter loaded via BootMixin.
  class BootApp extends BootMixin(RepositoryMixin(Application)) {}

  let app: BootApp;
  let bootstrapper: Bootstrapper;
  const booterKey = `${BootBindings.BOOTER_PREFIX}.TestBooter`;
  const booterKey2 = `${BootBindings.BOOTER_PREFIX}.TestBooter2`;

  beforeEach(getApplication);
  beforeEach(getBootStrapper);

  it('finds and runs registered booters', async () => {
    const ctx = await bootstrapper.boot();
    const booterInst = await ctx.get(booterKey);
    expect(booterInst.configureCalled).to.be.True();
    expect(booterInst.loadCalled).to.be.True();
  });

  it('binds booters passed in BootExecutionOptions', async () => {
    const ctx = await bootstrapper.boot({booters: [TestBooter2]});
    const booterInst2 = await ctx.get(booterKey2);
    expect(booterInst2).to.be.instanceof(TestBooter2);
    expect(booterInst2.configureCalled).to.be.True();
  });

  it('no booters run when BootOptions.filter.booters is []', async () => {
    const ctx = await bootstrapper.boot({filter: {booters: []}});
    const booterInst = await ctx.get(booterKey);
    expect(booterInst.configureCalled).to.be.False();
    expect(booterInst.loadCalled).to.be.False();
  });

  it('only runs booters passed in via BootOptions.filter.booters', async () => {
    const ctx = await bootstrapper.boot({
      booters: [TestBooter2],
      filter: {booters: ['TestBooter2']},
    });
    const booterInst = await ctx.get(booterKey);
    const booterInst2 = await ctx.get(booterKey2);
    expect(booterInst.configureCalled).to.be.False();
    expect(booterInst.loadCalled).to.be.False();
    expect(booterInst2.configureCalled).to.be.True();
  });

  it('only runs phases passed in via BootOptions.filter.phases', async () => {
    const ctx = await bootstrapper.boot({filter: {phases: ['configure']}});
    const booterInst = await ctx.get(booterKey);
    expect(booterInst.configureCalled).to.be.True();
    expect(booterInst.loadCalled).to.be.False();
  });

  /**
   * Sets 'app' as a new instance of Application. Registers TestBooter as a booter.
   */
  function getApplication() {
    app = new BootApp();
    app.booters(TestBooter);
  }

  /**
   * Sets 'bootstrapper' as a new instance of a Bootstrapper
   */
  function getBootStrapper() {
    bootstrapper = new Bootstrapper(app, __dirname);
  }

  /**
   * A TestBooter for testing purposes. Implements configure and load.
   */
  class TestBooter implements Booter {
    configureCalled = false;
    loadCalled = false;
    async configure() {
      this.configureCalled = true;
    }

    async load() {
      this.loadCalled = true;
    }
  }

  /**
   * A TestBooter for testing purposes. Implements configure.
   */
  class TestBooter2 implements Booter {
    configureCalled = false;
    async configure() {
      this.configureCalled = true;
    }
  }
});
