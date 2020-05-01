// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, Component} from '@loopback/core';
import {expect, givenHttpServerConfig, TestSandbox} from '@loopback/testlab';
import {resolve} from 'path';
import {
  BootBindings,
  BootMixin,
  createComponentApplicationBooterBinding,
} from '../..';
import {BooterApp} from '../fixtures/application';

describe('component application booter acceptance tests', () => {
  let app: BooterApp;
  const sandbox = new TestSandbox(resolve(__dirname, '../../.sandbox'), {
    // We intentionally use this flag so that `dist/application.js` can keep
    // its relative path to satisfy import statements
    subdir: false,
  });

  beforeEach('reset sandbox', () => sandbox.reset());
  beforeEach(getApp);

  it('binds artifacts booted from the component application', async () => {
    class BooterAppComponent implements Component {
      bindings = [createComponentApplicationBooterBinding(app)];
    }

    const mainApp = new MainApp();
    mainApp.component(BooterAppComponent);
    const appBindingsBeforeBoot = mainApp.find(
      // Exclude boot related bindings
      binding =>
        ![
          BootBindings.BOOT_OPTIONS.key,
          BootBindings.PROJECT_ROOT.key,
          BootBindings.BOOTSTRAPPER_KEY.key,
        ].includes(binding.key),
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

  async function getApp() {
    await sandbox.copyFile(resolve(__dirname, '../fixtures/package.json'));
    await sandbox.copyFile(resolve(__dirname, '../fixtures/application.js'));
    await sandbox.copyFile(
      resolve(__dirname, '../fixtures/multiple.artifact.js'),
      'controllers/multiple.controller.js',
    );

    const MyApp = require(resolve(sandbox.path, 'application.js')).BooterApp;
    app = new MyApp({
      rest: givenHttpServerConfig(),
    });
  }
});
