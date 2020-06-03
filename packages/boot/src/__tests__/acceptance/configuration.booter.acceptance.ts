// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, createBindingFromClass} from '@loopback/core';
import {expect, TestSandbox} from '@loopback/testlab';
import {Suite} from 'mocha';
import {resolve} from 'path';
import {ConfigurationLoader, configurationLoader} from '../../booters';
import {BooterApp} from '../fixtures/application';

describe('configuration booter acceptance tests', function (this: Suite) {
  this.timeout(5000);
  let app: BooterApp;
  const sandbox = new TestSandbox(resolve(__dirname, '../../.sandbox'), {
    // We intentionally use this flag so that `dist/application.js` can keep
    // its relative path to satisfy import statements
    subdir: false,
  });

  const configJson = `{
  "loggers.Log1": {
    "level": "info",
    "source": "json"
  },
  "loggers.Log2": {
    "level": "debug",
    "source": "json"
  }
}`;

  const configYaml = `
loggers.Log1:
  level: info
  source: yaml
loggers.Log2:
  level: debug
  source: yaml
`;

  const configJs = `
module.exports = {
  'loggers.Log1': {
    level: 'info',
    source: 'js',
  },
  'loggers.Log2': {
    level: 'debug',
    source: 'js',
  },
};`;

  beforeEach('reset sandbox', () => sandbox.reset());
  beforeEach(getApp);

  it('binds configuration objects for js', async () => {
    await givenJsConfig();
    await testConfigLoadedFrom('js');
  });

  it('binds configuration objects for js provider class', async () => {
    await givenJsConfigProvider();
    await testConfigLoadedFrom('js-provider');
  });

  it('binds configuration objects for json', async () => {
    await givenJsonConfig();
    await testConfigLoadedFrom('json');
  });

  it('binds configuration objects for yaml', async () => {
    await givenYamlConfig();
    await testConfigLoadedFrom('yaml');
  });

  it('binds configuration objects for yml', async () => {
    await givenYmlConfig();
    await testConfigLoadedFrom('yaml');
  });

  it('binds configuration objects for js over json', async () => {
    await givenJsonConfig();
    await givenJsConfig();
    await testConfigLoadedFrom('js');
  });

  it('binds configuration objects for js over yaml', async () => {
    await givenYamlConfig();
    await givenJsConfig();
    await testConfigLoadedFrom('js');
  });

  it('binds configuration objects for json over yaml', async () => {
    await givenJsonConfig();
    await givenYamlConfig();
    await testConfigLoadedFrom('json');
  });

  it('discovers files in <project>/configs', async () => {
    await sandbox.writeTextFile('configs/test.config.json', configJson);

    await sandbox.writeTextFile('configs/test.config.yaml', configYaml);
    await testConfigLoadedFrom('json');
  });

  it('allows extensions to load configurations', async () => {
    @configurationLoader()
    class MyConfigLoader implements ConfigurationLoader {
      options = {};

      load(_app: Application, projectRoot: string, files: string[]) {
        app.configure('loggers.Log1').to({
          level: 'info',
          source: 'my-loader',
        });
        return {
          'loggers.Log2': {
            level: 'debug',
            source: 'my-loader',
          },
        };
      }
    }
    app.add(createBindingFromClass(MyConfigLoader));
    await testConfigLoadedFrom('my-loader');
  });

  async function testConfigLoadedFrom(source: string) {
    await app.boot();
    const cfg1 = await app.getConfig('loggers.Log1');
    expect(cfg1).to.eql({level: 'info', source: source});
    const cfg2 = await app.getConfig('loggers.Log2');
    expect(cfg2).to.eql({level: 'debug', source: source});
  }

  async function givenJsConfig() {
    await sandbox.writeTextFile('dist/configs/test.config.js', configJs);
  }

  async function givenJsConfigProvider() {
    await sandbox.copyFile(
      resolve(__dirname, '../fixtures/config-provider.js'),
      'dist/configs/test-provider.config.js',
    );
  }

  async function givenJsonConfig() {
    await sandbox.writeTextFile('dist/configs/test.config.json', configJson);
  }

  async function givenYamlConfig() {
    await sandbox.writeTextFile('dist/configs/test.config.yaml', configYaml);
  }

  async function givenYmlConfig() {
    await sandbox.writeTextFile('dist/configs/test.config.yml', configYaml);
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
