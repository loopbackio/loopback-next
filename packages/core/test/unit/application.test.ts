// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Application, Server, Component} from '../../index';
import {Context} from '@loopback/context';

describe('Application', () => {
  describe('controller binding', () => {
    let app: Application;
    class MyController {}
    class MySecondController {}

    beforeEach(givenApp);

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

    it('binds multiple controllers passed in as an array', () => {
      const controllers = [MyController, MySecondController];
      const bindings = app.controllers(controllers);

      const bindA = bindings[0];
      expect(Array.from(bindA.tags)).to.containEql('controller');
      expect(bindA.key).to.equal('controllers.MyController');
      expect(findKeysByTag(app, 'controller')).to.containEql(bindA.key);

      const bindB = bindings[1];
      expect(Array.from(bindB.tags)).to.containEql('controller');
      expect(bindB.key).to.equal('controllers.MySecondController');
      expect(findKeysByTag(app, 'controller')).to.containEql(bindB.key);
    });

    function givenApp() {
      app = new Application();
    }
  });

  describe('component binding', () => {
    let app: Application;
    class MyController {}
    class MyComponent implements Component {
      controllers = [MyController];
    }
    class MySecondComponent implements Component {
      controllers = [MyController];
    }

    beforeEach(givenApp);

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

    it('binds multiple components passed in as an array', () => {
      app.components([MyComponent, MySecondComponent]);
      expect(findKeysByTag(app, 'component')).to.containEql(
        'components.MyComponent',
      );
      expect(findKeysByTag(app, 'component')).to.containEql(
        'components.MySecondComponent',
      );
    });

    function givenApp() {
      app = new Application();
    }
  });

  describe('server binding', () => {
    it('defaults to constructor name', async () => {
      const app = new Application();
      const binding = app.server(FakeServer);
      expect(Array.from(binding.tags)).to.containEql('server');
      const result = await app.getServer(FakeServer.name);
      expect(result.constructor.name).to.equal(FakeServer.name);
    });

    it('allows custom name', async () => {
      const app = new Application();
      const name = 'customName';
      app.server(FakeServer, name);
      const result = await app.getServer(name);
      expect(result.constructor.name).to.equal(FakeServer.name);
    });

    it('allows binding of multiple servers as an array', async () => {
      const app = new Application();
      const bindings = app.servers([FakeServer, FakerServer]);
      expect(Array.from(bindings[0].tags)).to.containEql('server');
      expect(Array.from(bindings[1].tags)).to.containEql('server');
      const fakeResult = await app.getServer(FakeServer);
      expect(fakeResult.constructor.name).to.equal(FakeServer.name);
      const fakerResult = await app.getServer(FakerServer);
      expect(fakerResult.constructor.name).to.equal(FakerServer.name);
    });
  });

  function findKeysByTag(ctx: Context, tag: string | RegExp) {
    return ctx.findByTag(tag).map(binding => binding.key);
  }
});

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

class FakerServer extends FakeServer {}
