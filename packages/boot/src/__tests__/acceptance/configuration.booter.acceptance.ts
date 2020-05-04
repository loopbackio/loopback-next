// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  ContextTags,
  createBindingFromClass,
  TagValueMatcher,
} from '@loopback/core';
import {expect, TestSandbox} from '@loopback/testlab';
import {resolve} from 'path';
import {ConfigurationLoader, configurationLoader} from '../../booters';
import {BooterApp} from '../fixtures/application';

describe('configuration booter acceptance tests', function () {
  // eslint-disable-next-line no-invalid-this
  this.timeout(5000);
  let app: BooterApp;
  const sandbox = new TestSandbox(resolve(__dirname, '../../.sandbox'), {
    // We intentionally use this flag so that `dist/application.js` can keep
    // its relative path to satisfy import statements
    subdir: false,
  });

  beforeEach('reset sandbox', () => sandbox.reset());
  beforeEach(getApp);

  it('binds configuration objects for js', async () => {
    await copyJs();
    await testConfigBooting('js');
  });

  it('binds configuration objects for js provider class', async () => {
    await copyJsProvider();
    await testConfigBooting('js-provider');
  });

  it('binds configuration objects for json', async () => {
    await copyJson();
    await testConfigBooting('json');
  });

  it('binds configuration objects for yaml', async () => {
    await copyYaml();
    await testConfigBooting('yaml');
  });

  it('binds configuration objects for yml', async () => {
    await copyYml();
    await testConfigBooting('yaml');
  });

  it('binds configuration objects for js over json', async () => {
    await copyJson();
    await copyJs();
    await testConfigBooting('js');
  });

  it('binds configuration objects for js over yaml', async () => {
    await copyYaml();
    await copyJs();
    await testConfigBooting('js');
  });

  it('binds configuration objects for json over yaml', async () => {
    await copyJson();
    await copyYaml();
    await testConfigBooting('json');
  });

  it('allows extensions to load configurations', async () => {
    @configurationLoader()
    class MyConfigLoader implements ConfigurationLoader {
      fileExtensions?: string[];
      load(_app: Application, projectRoot: string, files: string[]) {
        app.configure('loggers.Log1').to({
          level: 'info',
          __source: 'my-loader',
        });
        return {
          'loggers.Log2': {
            level: 'debug',
            __source: 'my-loader',
          },
        };
      }
    }
    app.add(createBindingFromClass(MyConfigLoader));
    await testConfigBooting('my-loader');
  });

  async function testConfigBooting(source: string) {
    await app.boot();
    const matcher: TagValueMatcher = val => {
      return (
        typeof val === 'string' &&
        ['loggers.Log1', 'loggers.Log2'].includes(val)
      );
    };
    const bindings = app.findByTag({[ContextTags.CONFIGURATION_FOR]: matcher});
    expect(bindings.length).to.eql(2);
    const cfg1 = await app.getConfig('loggers.Log1');
    expect(cfg1).to.eql({level: 'info', __source: source});
    const cfg2 = await app.getConfig('loggers.Log2');
    expect(cfg2).to.eql({level: 'debug', __source: source});
  }

  async function copyJs() {
    await sandbox.copyFile(
      resolve(__dirname, '../fixtures/config.js'),
      'dist/configs/test.config.js',
    );
  }

  async function copyJsProvider() {
    await sandbox.copyFile(
      resolve(__dirname, '../fixtures/config-provider.js'),
      'dist/configs/test-provider.config.js',
    );
  }

  async function copyJson() {
    await sandbox.copyFile(
      resolve(__dirname, '../../../src/__tests__/fixtures/config.json'),
      'dist/configs/test.config.json',
    );
  }

  async function copyYaml() {
    await sandbox.copyFile(
      resolve(__dirname, '../../../src/__tests__/fixtures/config.yaml'),
      'dist/configs/test.config.yaml',
    );
  }

  async function copyYml() {
    await sandbox.copyFile(
      resolve(__dirname, '../../../src/__tests__/fixtures/config.yaml'),
      'dist/configs/test.config.yml',
    );
  }

  async function getApp() {
    // Add the following files
    // - package.json
    // - dist/application.js
    await sandbox.copyFile(resolve(__dirname, '../fixtures/package.json'));
    await sandbox.copyFile(
      resolve(__dirname, '../fixtures/application.js'),
      'dist/application.js',
    );

    const MyApp = require(resolve(sandbox.path, 'dist/application.js'))
      .BooterApp;
    app = new MyApp({});
  }
});
