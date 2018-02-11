// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  Application,
  Server,
  Component,
  CoreBindings,
  Booter,
  BootOptions,
  BootExecutionOptions,
} from '../..';
import {Context, Constructor, BindingScope} from '@loopback/context';

describe('Application', () => {
  let app: Application;
  beforeEach(givenApp);

  describe('controller binding', () => {
    class MyController {}

    it('binds a controller', () => {
      const binding = app.controller(MyController);
      expect(Array.from(binding.tags)).to.containEql('controller');
      expect(binding.key).to.equal('controllers.MyController');
      expect(findKeysByTag(app, 'controller')).to.containEql(binding.key);
    });

    it('binds a controller with custom name', () => {
      const binding = app.controller(MyController, 'my-controller');
      expect(Array.from(binding.tags)).to.containEql('controller');
      expect(binding.key).to.equal('controllers.my-controller');
      expect(findKeysByTag(app, 'controller')).to.containEql(binding.key);
    });
  });

  describe('boot function', () => {
    it('calls .boot() if a BootComponent is bound', async () => {
      app
        .bind(CoreBindings.BOOTSTRAPPER)
        .toClass(FakeBootComponent)
        .inScope(BindingScope.SINGLETON);
      await app.boot();
      const bootComponent = await app.get(CoreBindings.BOOTSTRAPPER);
      expect(bootComponent.bootCalled).to.be.True();
    });
  });

  describe('booter binding', () => {
    it('binds a booter', async () => {
      const binding = app.booter(TestBooter);

      expect(Array.from(binding.tags)).to.containEql('booter');
      expect(binding.key).to.equal(`${CoreBindings.BOOTER_PREFIX}.TestBooter`);
      expect(findKeysByTag(app, CoreBindings.BOOTER_TAG)).to.containEql(
        binding.key,
      );
    });

    it('binds an array of booters', async () => {
      const bindings = app.booter([TestBooter, TestBooter2]);
      const keys = bindings.map(binding => binding.key);
      const expected = [
        `${CoreBindings.BOOTER_PREFIX}.TestBooter`,
        `${CoreBindings.BOOTER_PREFIX}.TestBooter2`,
      ];
      expect(keys.sort()).to.eql(expected.sort());
      expect(findKeysByTag(app, CoreBindings.BOOTER_TAG).sort()).to.eql(
        keys.sort(),
      );
    });
  });

  describe('component binding', () => {
    class MyController {}
    class MyComponent implements Component {
      controllers = [MyController];
    }

    it('binds a component', () => {
      app.component(MyComponent);
      expect(findKeysByTag(app, 'component')).to.containEql(
        'components.MyComponent',
      );
    });

    it('binds a component with custom name', () => {
      app.component(MyComponent, 'my-component');
      expect(findKeysByTag(app, 'component')).to.containEql(
        'components.my-component',
      );
    });

    it('binds a booter from a component', () => {
      app.component(FakeBooterComponent);
      expect(findKeysByTag(app, CoreBindings.BOOTER_TAG)).to.containEql(
        `${CoreBindings.BOOTER_PREFIX}.TestBooter`,
      );
    });
  });

  describe('server binding', () => {
    it('defaults to constructor name', async () => {
      const binding = app.server(FakeServer);
      expect(Array.from(binding.tags)).to.containEql('server');
      const result = await app.getServer(FakeServer.name);
      expect(result.constructor.name).to.equal(FakeServer.name);
    });

    it('allows custom name', async () => {
      const name = 'customName';
      app.server(FakeServer, name);
      const result = await app.getServer(name);
      expect(result.constructor.name).to.equal(FakeServer.name);
    });

    it('allows binding of multiple servers as an array', async () => {
      app = new Application();
      const bindings = app.servers([FakeServer, AnotherServer]);
      expect(Array.from(bindings[0].tags)).to.containEql('server');
      expect(Array.from(bindings[1].tags)).to.containEql('server');
      const fakeResult = await app.getServer(FakeServer);
      expect(fakeResult.constructor.name).to.equal(FakeServer.name);
      const AnotherResult = await app.getServer(AnotherServer);
      expect(AnotherResult.constructor.name).to.equal(AnotherServer.name);
    });
  });

  describe('start', () => {
    it('starts all injected servers', async () => {
      app = new Application();
      app.component(FakeComponent);

      await app.start();
      const server = await app.getServer(FakeServer);
      expect(server).to.not.be.null();
      expect(server.running).to.equal(true);
      await app.stop();
    });

    it('does not attempt to start poorly named bindings', async () => {
      app = new Application();
      app.component(FakeComponent);

      // The app.start should not attempt to start this binding.
      app.bind('controllers.servers').to({});
      await app.start();
      await app.stop();
    });
  });

  function givenApp() {
    app = new Application({projectRoot: __dirname});
  }

  function findKeysByTag(ctx: Context, tag: string | RegExp) {
    return ctx.findByTag(tag).map(binding => binding.key);
  }
});

class FakeComponent implements Component {
  servers: {
    [name: string]: Constructor<Server>;
  };
  constructor() {
    this.servers = {
      FakeServer,
      FakeServer2: FakeServer,
    };
  }
}

class FakeBootComponent implements Component {
  bootCalled = false;

  async boot(options: BootOptions, execOptions?: BootExecutionOptions) {
    this.bootCalled = true;
  }
}

class FakeServer extends Context implements Server {
  running: boolean = false;
  constructor() {
    super();
  }
  async start(): Promise<void> {
    this.running = true;
  }

  async stop(): Promise<void> {
    this.running = false;
  }
}

class AnotherServer extends FakeServer {}

class TestBooter implements Booter {
  async configure() {}
}

class TestBooter2 implements Booter {
  async configure() {}
}

class FakeBooterComponent implements Component {
  booters = [TestBooter];
}
