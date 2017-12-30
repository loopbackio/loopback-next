// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {BootTestApplication} from '../../fakeApp';
import {
  HelloController,
  WorldController,
} from '../../fakeApp/controllers/hello.controller';
import {AdminController} from '../../fakeApp/controllers/admin/admin.controller';
import {TestRepository} from '../../fakeApp/repositories/test.repository';
import {Constructor} from '@loopback/context';
import {resolve} from 'path';

describe('BootMixin()', () => {
  let myApp: BootTestApplication;
  let rootDir: string;

  before(getRootDir);
  beforeEach(getApplication);
  afterEach(stopApp);

  describe('basic function presence tests', () => {
    it('has .boot() function', () => {
      expect(myApp.boot).to.be.a.Function();
    });

    it('has .bootControllers() function', () => {
      expect(myApp.bootControllers).to.be.a.Function();
    });

    it('has .bootClassArtifacts() function', () => {
      expect(myApp.bootClassArtifacts).to.be.a.Function();
    });

    it('has .bindClassArtifacts() function', () => {
      expect(myApp.bindClassArtifacts).to.be.a.Function();
    });

    it('has .bindClassArtifactsUsingFunction() function', () => {
      expect(myApp.bindClassArtifactsUsingFunction).to.be.a.Function();
    });
  });

  it('binds controllers automatically', async () => {
    const expected = [
      'controllers.AdminController',
      'controllers.HelloController',
      'controllers.WorldController',
    ];

    await myApp.start();

    checkBindingsArr('controllers', expected);
    checkBindingInstance('controllers.HelloController', HelloController);
    checkBindingInstance('controllers.WorldController', WorldController);
    checkBindingInstance('controllers.AdminController', AdminController);
  });

  it('allows other class artifacts to be booted using prefix', () => {
    const expected = ['repositories.TestRepository'];

    myApp.bootClassArtifacts('repositories', '.repository.js', 'repositories');

    checkBindingsArr('repositories', expected);
    checkBindingInstance('repositories.TestRepository', TestRepository);
  });

  it('allows other class artifacts to be booted using function', () => {
    const expected = ['repositoryUsingFunc.TestRepository'];
    function bindRepoClass(inst: Constructor<{}>) {
      myApp.bind(`repositoryUsingFunc.${inst.name}`).toClass(inst);
    }

    myApp.bootClassArtifacts('repositories', '.repository.js', bindRepoClass);

    checkBindingsArr('repositoryUsingFunc', expected);
    checkBindingInstance('repositoryUsingFunc.TestRepository', TestRepository);
  });

  it('discovers classes in given files and binds to a given prefix', () => {
    const files = [resolve(rootDir, 'repositories/test.repository.js')];
    const expected = ['repoPrefix.TestRepository'];

    myApp.bindClassArtifacts(files, 'repoPrefix');

    checkBindingsArr('repoPrefix', expected);
    checkBindingInstance('repoPrefix.TestRepository', TestRepository);
  });

  it('discovers classes in given files and calls function to bind', () => {
    const files = [resolve(rootDir, 'repositories/test.repository.js')];
    const expected = ['repoFunc.TestRepository'];
    function bindFunc(inst: Constructor<{}>) {
      myApp.bind(`repoFunc.${inst.name}`).toClass(inst);
    }

    myApp.bindClassArtifactsUsingFunction(files, bindFunc);

    checkBindingsArr('repoFunc', expected);
    checkBindingInstance('repoFunc.TestRepository', TestRepository);
  });

  function checkBindingInstance(key: string, inst: Constructor<{}>) {
    const binding = myApp.getSync(key);
    expect(binding).to.be.instanceOf(inst);
  }

  function checkBindingsArr(prefix: string, expected: string[]) {
    const bindings = myApp.find(`${prefix}.*`).map(b => b.key);
    expect(bindings.sort()).to.eql(expected.sort());
  }

  function getRootDir() {
    rootDir =
      process.cwd().indexOf('packages') > -1
        ? 'dist/test/fakeApp/'
        : 'packages/boot/dist/test/fakeApp/';
  }

  function getApplication() {
    myApp = new BootTestApplication({boot: {rootDir: rootDir}});
  }

  async function stopApp() {
    try {
      await myApp.stop();
    } catch (err) {
      console.log(`Stopping the app threw an error: ${err}`);
    }
  }
});
