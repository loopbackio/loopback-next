// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, Component} from '@loopback/core';
import {expect, givenHttpServerConfig, TestSandbox} from '@loopback/testlab';
import fs from 'fs';
import {resolve} from 'path';
import {BootMixin, createComponentApplicationBooterBinding} from '../..';
import {bindingKeysExcludedFromSubApp} from '../../booters';
import {Bootable} from '../../types';
import {BooterApp} from '../fixtures/application';

describe('component application booter acceptance tests', () => {
  let app: BooterApp;
  const sandbox = new TestSandbox(resolve(__dirname, '../../.sandbox'));

  beforeEach('reset sandbox', () => sandbox.reset());
  beforeEach(getApp);

  after('delete sandbox', () => sandbox.delete());

  it('binds artifacts booted from the component application', async () => {
    class BooterAppComponent implements Component {
      bindings = [createComponentApplicationBooterBinding(app)];
    }

    const mainApp = new MainApp();
    mainApp.component(BooterAppComponent);
    await testSubAppBoot(mainApp);
  });

  it('binds artifacts booted from the sub application', async () => {
    const mainApp = new MainAppWithSubAppBooter();
    await testSubAppBoot(mainApp);
  });

  it('binds artifacts booted from the component application by filter', async () => {
    class BooterAppComponent implements Component {
      bindings = [
        createComponentApplicationBooterBinding(app, binding => {
          return binding.key === 'controllers.ArtifactOne';
        }),
      ];
    }

    const mainApp = new MainApp();
    mainApp.component(BooterAppComponent);
    await mainApp.boot();
    const controllers = mainApp.find('controllers.*').map(b => b.key);
    expect(controllers).to.eql(['controllers.ArtifactOne']);
  });

  it('does not override locked bindings', async () => {
    class BooterAppComponent implements Component {
      bindings = [createComponentApplicationBooterBinding(app)];
    }

    const mainApp = new MainApp();
    const lockedBinding = mainApp
      .bind('controllers.ArtifactTwo')
      .to('-locked-')
      .lock();
    mainApp.component(BooterAppComponent);
    await mainApp.boot();
    const current = mainApp.getBinding('controllers.ArtifactTwo', {
      optional: true,
    });
    expect(current).to.be.exactly(lockedBinding);
  });

  class MainApp extends BootMixin(Application) {
    constructor() {
      super();
      this.projectRoot = __dirname;
    }
  }

  class MainAppWithSubAppBooter extends BootMixin(Application) {
    constructor() {
      super();
      this.projectRoot = __dirname;
      this.applicationBooter(app);
    }
  }

  async function getApp() {
    const appJsFile = resolve(__dirname, '../fixtures/application.js');
    let appJs = fs.readFileSync(appJsFile, 'utf-8');
    // Adjust the relative path for `import`
    appJs = appJs.replace('../..', '../../..');
    await sandbox.writeTextFile('application.js', appJs);

    await sandbox.copyFile(resolve(__dirname, '../fixtures/package.json'));
    await sandbox.copyFile(
      resolve(__dirname, '../fixtures/multiple.artifact.js'),
      'controllers/multiple.controller.js',
    );

    const MyApp = require(resolve(sandbox.path, 'application.js')).BooterApp;
    app = new MyApp({
      rest: givenHttpServerConfig(),
    });
  }

  async function testSubAppBoot(mainApp: Application & Bootable) {
    const appBindingsBeforeBoot = mainApp.find(
      // Exclude boot related bindings
      binding => !bindingKeysExcludedFromSubApp.includes(binding.key),
    );
    await mainApp.boot();
    const controllers = mainApp.find('controllers.*').map(b => b.key);
    expect(controllers).to.eql([
      'controllers.ArtifactOne',
      'controllers.ArtifactTwo',
    ]);

    // Assert main app bindings before boot are not overridden
    const appBindingsAfterBoot = mainApp.find(binding =>
      appBindingsBeforeBoot.includes(binding),
    );
    expect(appBindingsAfterBoot.map(b => b.key)).to.eql(
      appBindingsBeforeBoot.map(b => b.key),
    );
  }
});
