// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, BindingKey, ContextTags, injectable} from '@loopback/core';
import {expect, sinon} from '@loopback/testlab';
import {BootBindings, Booter, BootMixin} from '../../..';

describe('BootMixin unit tests', () => {
  let app: AppWithBootMixin;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let stub: sinon.SinonStub<[any?, ...any[]], void>;

  beforeEach(getApp);
  beforeEach(createStub);
  afterEach(restoreStub);

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
    const booter = await app.get(`${BootBindings.BOOTERS}.TestBooter`);
    expect(booter).to.be.an.instanceOf(TestBooter);
  });

  it('binds booter with `@injectable` from app.booters()', async () => {
    app.booters(TestBooterWithBind);
    const booterBinding = app.getBinding(
      `${BootBindings.BOOTERS}.TestBooterWithBind`,
    );
    expect(booterBinding.tagMap).to.containEql({artifactType: 'xsd'});
  });

  it('binds booter with `@injectable` using a custom binding key', async () => {
    const testApp = new AppWithBootMixin();
    testApp.bind(BootBindings.PROJECT_ROOT).to(__dirname);
    testApp.booters(TestBooterWithCustomBindingKey);

    await testApp.boot();
    const booterBinding = testApp.getBinding(
      `io.loopback.custom.binding.TestBooterWithCustomBindingKey`,
    );
    const component = await testApp.get<TestBooterWithCustomBindingKey>(
      `io.loopback.custom.binding.TestBooterWithCustomBindingKey`,
    );
    expect(booterBinding.tagMap).to.containEql({artifactType: 'bmp'});
    expect(component.configured).true();
  });

  it('binds booter from app.booters() as singletons by default', async () => {
    app.booters(TestBooter);
    const booter1 = await app.get(`${BootBindings.BOOTERS}.TestBooter`);
    const booter2 = await app.get(`${BootBindings.BOOTERS}.TestBooter`);
    expect(booter1).to.be.exactly(booter2);
  });

  it('binds multiple booter classes from app.booters()', async () => {
    app.booters(TestBooter, AnotherTestBooter);
    const booter = await app.get(`${BootBindings.BOOTERS}.TestBooter`);
    expect(booter).to.be.an.instanceOf(TestBooter);

    const anotherBooter = await app.get(
      `${BootBindings.BOOTERS}.AnotherTestBooter`,
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
    const booterInst = await app.get(`${BootBindings.BOOTERS}.TestBooter`);
    expect(booterInst).to.be.an.instanceOf(TestBooter);
  });

  it('warns if app is started without booting', async () => {
    await app.start();
    sinon.assert.calledWith(
      stub,
      'App started without booting. Did you forget to call `await app.boot()`?',
    );
  });

  class TestBooter implements Booter {
    configured = false;

    async configure() {
      this.configured = true;
    }
  }

  @injectable({tags: {artifactType: 'xsd'}})
  class TestBooterWithBind implements Booter {
    configured = false;

    async configure() {
      this.configured = true;
    }
  }

  const CustomBinding = BindingKey.create<TestBooterWithCustomBindingKey>(
    'io.loopback.custom.binding.TestBooterWithCustomBindingKey',
  );
  @injectable({
    tags: {
      [ContextTags.KEY]: CustomBinding,
      artifactType: 'bmp',
    },
  })
  class TestBooterWithCustomBindingKey implements Booter {
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

  function restoreStub() {
    stub.restore();
  }

  function createStub() {
    stub = sinon.stub(process, 'emitWarning');
  }
});
