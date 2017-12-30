// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, Client, createClientForHandler} from '@loopback/testlab';
import {NormalApplication} from '../fakeApp';
import {Constructor, Binding} from '@loopback/context';
import {BootMixin} from '../..';
import {RestServer} from '@loopback/rest';
import {
  HelloController,
  WorldController,
} from '../fakeApp/controllers/hello.controller';
import {AdminController} from '../fakeApp/controllers/admin/admin.controller';
import {TestRepository} from '../fakeApp/repositories/test.repository';

describe('@loopback/boot integration', () => {
  class BootWithTestMixin extends TestMixin(BootMixin(NormalApplication)) {}
  class BootWithTestMixinReverse extends BootMixin(
    TestMixin(NormalApplication),
  ) {}

  let rootDir: string;

  // Using any type for app so we can use the same stopApp function!
  // tslint:disable-next-line:no-any
  let app: any;
  let client: Client;

  before(getRootDir);
  afterEach(stopApp);

  it('booted controllers / app works as expected with TestMixin(BootMixin())', async () => {
    app = new BootWithTestMixin({boot: {rootDir: rootDir}});
    const expectedCtrls = [
      'controllers.AdminController',
      'controllers.HelloController',
      'controllers.WorldController',
    ];
    const expectedRepos = ['testMixinRepo.TestRepository'];

    await app.start();
    const server: RestServer = await app.getServer(RestServer);
    client = createClientForHandler(server.handleHttp);

    checkBindingsArr('controllers', expectedCtrls);
    checkBindingInstance('controllers.HelloController', HelloController);
    checkBindingInstance('controllers.WorldController', WorldController);
    checkBindingInstance('controllers.AdminController', AdminController);
    await checkClientResponses();
    checkBindingsArr('testMixinRepo', expectedRepos);
    checkBindingInstance('testMixinRepo.TestRepository', TestRepository);
  });

  it('booted controllers / app works as expected with BootMixin(TestMixin())', async () => {
    app = new BootWithTestMixinReverse({boot: {rootDir: rootDir}});
    const expectedCtrls = [
      'controllers.AdminController',
      'controllers.HelloController',
      'controllers.WorldController',
    ];
    const expectedRepos = ['testMixinRepo.TestRepository'];

    await app.start();
    const server: RestServer = await app.getServer(RestServer);
    client = createClientForHandler(server.handleHttp);

    checkBindingsArr('controllers', expectedCtrls);
    checkBindingInstance('controllers.HelloController', HelloController);
    checkBindingInstance('controllers.WorldController', WorldController);
    checkBindingInstance('controllers.AdminController', AdminController);
    await checkClientResponses();
    checkBindingsArr('testMixinRepo', expectedRepos);
    checkBindingInstance('testMixinRepo.TestRepository', TestRepository);
  });

  async function checkClientResponses() {
    await client.get('/').expect(200, 'Hello World');
    await client.get('/world').expect(200, 'Hi from world controller');
    await client.get('/admin').expect(200, 'Hello Admin');
  }

  function checkBindingInstance(key: string, inst: Constructor<{}>) {
    const binding = app.getSync(key);
    expect(binding).to.be.instanceOf(inst);
  }

  function checkBindingsArr(prefix: string, expected: string[]) {
    const bindings = app.find(`${prefix}.*`).map((b: Binding) => b.key);
    expect(bindings.sort()).to.eql(expected.sort());
  }

  function getRootDir() {
    rootDir =
      process.cwd().indexOf('packages') > -1
        ? 'dist/test/fakeApp/'
        : 'packages/boot/dist/test/fakeApp/';
  }

  async function stopApp() {
    try {
      await app.stop();
    } catch (err) {
      console.log(`Stopping the app threw an error: ${err}`);
    }
  }
});

// tslint:disable-next-line:no-any
function TestMixin<T extends Constructor<any>>(superClass: T) {
  return class extends superClass {
    // tslint:disable-next-line:no-any
    constructor(...args: any[]) {
      super(...args);
    }

    async boot() {
      const repoDir = this.options.boot.repoDir || 'repositories';
      await this.bootClassArtifacts(repoDir, 'repository.js', 'testMixinRepo');
      if (super.boot) await super.boot();
    }
  };
}
