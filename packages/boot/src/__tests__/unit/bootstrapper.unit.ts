// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {expect, sinon} from '@loopback/testlab';
import {BootBindings, Booter, BootMixin, Bootstrapper} from '../..';

describe('boot-strapper unit tests', () => {
  // RepositoryMixin is added to avoid warning message printed logged to console
  // due to the fact that RepositoryBooter is a default Booter loaded via BootMixin.
  class BootApp extends BootMixin(RepositoryMixin(Application)) {}

  let app: BootApp;
  let bootstrapper: Bootstrapper;
  const booterKey = `${BootBindings.BOOTERS}.TestBooter`;
  const anotherBooterKey = `${BootBindings.BOOTERS}.AnotherBooter`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let stub: sinon.SinonStub<[any?, ...any[]], void>;

  beforeEach(getApplication);
  beforeEach(getBootStrapper);
  beforeEach(createStub);
  afterEach(restoreStub);

  it('finds and runs registered booters', async () => {
    const ctx = await bootstrapper.boot();
    const booterInst = await ctx.get<TestBooter>(booterKey);
    expect(booterInst.phasesCalled).to.eql([
      'TestBooter:configure',
      'TestBooter:load',
    ]);
  });

  it('binds booters passed in BootExecutionOptions', async () => {
    const ctx = await bootstrapper.boot({booters: [AnotherBooter]});
    const anotherBooterInst = await ctx.get<AnotherBooter>(anotherBooterKey);
    expect(anotherBooterInst).to.be.instanceof(AnotherBooter);
    expect(anotherBooterInst.phasesCalled).to.eql(['AnotherBooter:configure']);
  });

  it('no booters run when BootOptions.filter.booters is []', async () => {
    const ctx = await bootstrapper.boot({filter: {booters: []}});
    const booterInst = await ctx.get<TestBooter>(booterKey);
    expect(booterInst.phasesCalled).to.eql([]);
  });

  it('only runs booters passed in via BootOptions.filter.booters', async () => {
    const ctx = await bootstrapper.boot({
      booters: [AnotherBooter],
      filter: {booters: ['AnotherBooter']},
    });
    const testBooterInst = await ctx.get<TestBooter>(booterKey);
    const anotherBooterInst = await ctx.get<AnotherBooter>(anotherBooterKey);
    const phasesCalled = testBooterInst.phasesCalled.concat(
      anotherBooterInst.phasesCalled,
    );
    expect(phasesCalled).to.eql(['AnotherBooter:configure']);
  });

  it('only runs phases passed in via BootOptions.filter.phases', async () => {
    const ctx = await bootstrapper.boot({filter: {phases: ['configure']}});
    const booterInst = await ctx.get<TestBooter>(booterKey);
    expect(booterInst.phasesCalled).to.eql(['TestBooter:configure']);
  });

  it('sets application states', async () => {
    const boot = app.boot();
    expect(app.state).to.eql('booting');
    await boot;
    expect(app.state).to.eql('booted');
    // No-op
    await app.boot();
    expect(app.state).to.eql('booted');
    const start = app.start();
    expect(app.state).to.equal('initializing');
    await start;
    expect(app.state).to.equal('started');
    const stop = app.stop();
    expect(app.state).to.equal('stopping');
    await stop;
    expect(app.state).to.equal('stopped');
  });

  it('awaits booted if the application is booting', async () => {
    const boot = app.boot();
    expect(app.state).to.eql('booting');
    const bootAgain = app.boot();
    await boot;
    await bootAgain;
    expect(app.state).to.eql('booted');
  });

  it('throws error with invalid application states', async () => {
    await app.start();
    await expect(app.boot()).to.be.rejectedWith(
      /Cannot boot the application as it is started\. Valid states are created,booted\./,
    );
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
    private configureCalled = false;
    private loadCalled = false;
    async configure() {
      this.configureCalled = true;
    }

    async load() {
      this.loadCalled = true;
    }

    get phasesCalled() {
      const result = [];
      if (this.configureCalled) result.push('TestBooter:configure');
      if (this.loadCalled) result.push('TestBooter:load');
      return result;
    }
  }

  /**
   * A TestBooter for testing purposes. Implements configure.
   */
  class AnotherBooter implements Booter {
    private configureCalled = false;
    async configure() {
      this.configureCalled = true;
    }

    get phasesCalled() {
      const result = [];
      if (this.configureCalled) result.push('AnotherBooter:configure');
      return result;
    }
  }

  function restoreStub() {
    stub.restore();
  }

  function createStub() {
    stub = sinon.stub(process, 'emitWarning');
  }
});
