// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const assert = require('yeoman-assert');
const testlab = require('@loopback/testlab');

const expect = testlab.expect;
const TestSandbox = testlab.TestSandbox;

const generator = path.join(__dirname, '../../../generators/service');

const testUtils = require('../../test-utils');

// Test Sandbox
const SANDBOX_PATH = path.resolve(__dirname, '..', '.sandbox');
const sandbox = new TestSandbox(SANDBOX_PATH);

describe('lb4 service', () => {
  beforeEach('reset sandbox', async () => {
    await sandbox.reset();
  });

  describe('invalid generation of services', () => {
    it('does not run with empty datasource list', async () => {
      return expect(
        testUtils
          .executeGenerator(generator)
          .inDir(SANDBOX_PATH, () =>
            testUtils.givenLBProject(SANDBOX_PATH, {}, SANDBOX_FILES),
          ),
      ).to.be.rejectedWith(/No datasources found/);
    });
  });

  describe('valid generation of services', () => {
    it('generates a basic soap service from command line arguments', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(
            SANDBOX_PATH,
            {includeSandboxFilesFixtures: true},
            SANDBOX_FILES,
          ),
        )
        .withArguments('myService --datasource myds');
      const expectedFile = path.join(
        SANDBOX_PATH,
        SERVICE_APP_PATH,
        'my-service.service.ts',
      );
      assert.file(expectedFile);
      assert.fileContent(
        expectedFile,
        /export class MyServiceServiceProvider implements Provider<MyServiceService> {/,
      );
      assert.fileContent(expectedFile, /export interface MyServiceService {/);
      assert.fileContent(expectedFile, /\@inject\('datasources.myds'\)/);
      assert.fileContent(
        expectedFile,
        /value\(\): Promise\<MyServiceService\> {/,
      );
      assert.file(INDEX_FILE);
      assert.fileContent(INDEX_FILE, /export \* from '.\/my-service.service';/);
    });

    it('generates a soap service from a config file', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(
            SANDBOX_PATH,
            {includeSandboxFilesFixtures: true},
            SANDBOX_FILES,
          ),
        )
        .withArguments('--config mysoapconfig.json');
      const expectedFile = path.join(
        SANDBOX_PATH,
        SERVICE_APP_PATH,
        'multi-word-service.service.ts',
      );
      assert.file(expectedFile);
      assert.fileContent(
        expectedFile,
        /export class MultiWordServiceServiceProvider implements Provider\<MultiWordServiceService\> {/,
      );
      assert.fileContent(
        expectedFile,
        /protected datasource: MydsDataSource = new MydsDataSource\(\),/,
      );
      assert.fileContent(
        expectedFile,
        /value\(\): Promise\<MultiWordServiceService\> {/,
      );
      assert.file(INDEX_FILE);
      assert.fileContent(
        INDEX_FILE,
        /export \* from '.\/multi-word-service.service';/,
      );
    });

    it('generates a basic soap service from the prompts', async () => {
      const multiItemPrompt = {
        name: 'myService',
        dataSourceClass: 'MydsDatasource',
      };
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(
            SANDBOX_PATH,
            {includeSandboxFilesFixtures: true},
            SANDBOX_FILES,
          ),
        )
        .withPrompts(multiItemPrompt);

      const expectedFile = path.join(
        SANDBOX_PATH,
        SERVICE_APP_PATH,
        'my-service.service.ts',
      );
      assert.file(expectedFile);
      assert.fileContent(
        expectedFile,
        /export class MyServiceServiceProvider implements Provider<MyServiceService> {/,
      );
      assert.fileContent(expectedFile, /export interface MyServiceService {/);
      assert.fileContent(expectedFile, /\@inject\('datasources.myds'\)/);
      assert.fileContent(
        expectedFile,
        /value\(\): Promise\<MyServiceService\> {/,
      );
      assert.file(INDEX_FILE);
      assert.fileContent(INDEX_FILE, /export \* from '.\/my-service.service';/);
    });

    it('generates a basic rest service from the prompts', async () => {
      const multiItemPrompt = {
        name: 'myservice',
        dataSourceClass: 'RestdbDatasource',
      };

      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(
            SANDBOX_PATH,
            {includeSandboxFilesFixtures: true},
            SANDBOX_FILES,
          ),
        )
        .withPrompts(multiItemPrompt);

      const expectedFile = path.join(
        SANDBOX_PATH,
        SERVICE_APP_PATH,
        'myservice.service.ts',
      );
      assert.file(expectedFile);
      assert.fileContent(
        expectedFile,
        /export class MyserviceServiceProvider implements Provider<MyserviceService> {/,
      );
      assert.fileContent(expectedFile, /export interface MyserviceService {/);
      assert.fileContent(expectedFile, /\@inject\('datasources.restdb'\)/);
      assert.fileContent(
        expectedFile,
        /value\(\): Promise\<MyserviceService\> {/,
      );
      assert.file(INDEX_FILE);
      assert.fileContent(INDEX_FILE, /export \* from '.\/myservice.service';/);
    });
    it('generates a basic rest service from a config file', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(
            SANDBOX_PATH,
            {includeSandboxFilesFixtures: true},
            SANDBOX_FILES,
          ),
        )
        .withArguments('--config myrestconfig.json');
      const expectedFile = path.join(
        SANDBOX_PATH,
        SERVICE_APP_PATH,
        'myservice.service.ts',
      );
      assert.file(expectedFile);
      assert.fileContent(
        expectedFile,
        /export class MyserviceServiceProvider implements Provider<MyserviceService> {/,
      );
      assert.fileContent(expectedFile, /export interface MyserviceService {/);
      assert.fileContent(expectedFile, /\@inject\('datasources.restdb'\)/);
      assert.fileContent(
        expectedFile,
        /value\(\): Promise\<MyserviceService\> {/,
      );
      assert.file(INDEX_FILE);
      assert.fileContent(INDEX_FILE, /export \* from '.\/myservice.service';/);
    });
    it('generates a basic rest service from command line arguments', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(
            SANDBOX_PATH,
            {includeSandboxFilesFixtures: true},
            SANDBOX_FILES,
          ),
        )
        .withArguments('myservice --datasource restdb');
      const expectedFile = path.join(
        SANDBOX_PATH,
        SERVICE_APP_PATH,
        'myservice.service.ts',
      );
      assert.file(expectedFile);
      assert.fileContent(
        expectedFile,
        /export class MyserviceServiceProvider implements Provider<MyserviceService> {/,
      );
      assert.fileContent(expectedFile, /export interface MyserviceService {/);
      assert.fileContent(expectedFile, /\@inject\('datasources.restdb'\)/);
      assert.fileContent(
        expectedFile,
        /value\(\): Promise\<MyserviceService\> {/,
      );
      assert.file(INDEX_FILE);
      assert.fileContent(INDEX_FILE, /export \* from '.\/myservice.service';/);
    });
  });
});

// Sandbox constants
const DATASOURCE_APP_PATH = 'src/datasources';
const CONFIG_PATH = '.';
const SERVICE_APP_PATH = 'src/services';
const INDEX_FILE = path.join(SANDBOX_PATH, SERVICE_APP_PATH, 'index.ts');
const DUMMY_CONTENT = '--DUMMY VALUE--';

const SANDBOX_FILES = [
  {
    path: CONFIG_PATH,
    file: 'mysoapconfig.json',
    content: `{
      "name": "MultiWordService",
      "datasource": "myds"
    }`,
  },
  {
    path: CONFIG_PATH,
    file: 'myrestconfig.json',
    content: `{
      "name": "myservice",
      "datasource": "restdb"
    }`,
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'myds.datasource.json',
    content: JSON.stringify({
      name: 'myds',
      connector: 'soap',
    }),
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'myds.datasource.ts',
    content: DUMMY_CONTENT,
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'dbmem.datasource.json',
    content: JSON.stringify({
      name: 'dbmem',
      connector: 'memory',
    }),
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'dbmem.datasource.ts',
    content: DUMMY_CONTENT,
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'restdb.datasource.json',
    content: JSON.stringify({
      name: 'restdb',
      connector: 'rest',
    }),
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'restdb.datasource.ts',
    content: DUMMY_CONTENT,
  },
];
