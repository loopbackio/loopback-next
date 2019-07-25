// Copyright IBM Corp. 2018,2019. All Rights Reserved.
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
const SANDBOX_FILES = require('../../fixtures/service').SANDBOX_FILES;
const testUtils = require('../../test-utils');

// Test Sandbox
const SANDBOX_PATH = path.resolve(__dirname, '..', '.sandbox');
const sandbox = new TestSandbox(SANDBOX_PATH);

describe('lb4 service (remote)', () => {
  beforeEach('reset sandbox', async () => {
    await sandbox.reset();
  });

  describe('invalid generation of services', () => {
    it('does not run with empty datasource list', async () => {
      return expect(
        testUtils
          .executeGenerator(generator)
          .inDir(SANDBOX_PATH, () => testUtils.givenLBProject(SANDBOX_PATH)),
      ).to.be.rejectedWith(/No datasources found/);
    });
  });

  describe('valid generation of services', () => {
    it('generates a basic soap service from command line arguments', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: SANDBOX_FILES,
          }),
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
        /export class MyServiceProvider implements Provider<MyService> {/,
      );
      assert.fileContent(expectedFile, /export interface MyService {/);
      assert.fileContent(expectedFile, /\@inject\('datasources.myds'\)/);
      assert.fileContent(expectedFile, /value\(\): Promise\<MyService\> {/);
      assert.file(INDEX_FILE);
      assert.fileContent(INDEX_FILE, /export \* from '.\/my-service.service';/);
    });

    it('generates a soap service from a config file', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: SANDBOX_FILES,
          }),
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
        /export class MultiWordServiceProvider implements Provider\<MultiWordService\> {/,
      );
      assert.fileContent(
        expectedFile,
        /dataSource: MydsDataSource = new MydsDataSource\(\),/,
      );
      assert.fileContent(
        expectedFile,
        /value\(\): Promise\<MultiWordService\> {/,
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
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: SANDBOX_FILES,
          }),
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
        /export class MyServiceProvider implements Provider<MyService> {/,
      );
      assert.fileContent(expectedFile, /export interface MyService {/);
      assert.fileContent(expectedFile, /\@inject\('datasources.myds'\)/);
      assert.fileContent(expectedFile, /value\(\): Promise\<MyService\> {/);
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
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: SANDBOX_FILES,
          }),
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
        /export class MyserviceProvider implements Provider<Myservice> {/,
      );
      assert.fileContent(expectedFile, /export interface Myservice {/);
      assert.fileContent(expectedFile, /\@inject\('datasources.restdb'\)/);
      assert.fileContent(expectedFile, /value\(\): Promise\<Myservice\> {/);
      assert.file(INDEX_FILE);
      assert.fileContent(INDEX_FILE, /export \* from '.\/myservice.service';/);
    });
    it('generates a basic rest service from a config file', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: SANDBOX_FILES,
          }),
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
        /export class MyserviceProvider implements Provider<Myservice> {/,
      );
      assert.fileContent(expectedFile, /export interface Myservice {/);
      assert.fileContent(expectedFile, /\@inject\('datasources.restdb'\)/);
      assert.fileContent(expectedFile, /value\(\): Promise\<Myservice\> {/);
      assert.file(INDEX_FILE);
      assert.fileContent(INDEX_FILE, /export \* from '.\/myservice.service';/);
    });
    it('generates a basic rest service from command line arguments', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: SANDBOX_FILES,
          }),
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
        /export class MyserviceProvider implements Provider<Myservice> {/,
      );
      assert.fileContent(expectedFile, /export interface Myservice {/);
      assert.fileContent(expectedFile, /\@inject\('datasources.restdb'\)/);
      assert.fileContent(expectedFile, /value\(\): Promise\<Myservice\> {/);
      assert.file(INDEX_FILE);
      assert.fileContent(INDEX_FILE, /export \* from '.\/myservice.service';/);
    });

    it('generates a basic soap service with capital datasource name', async () => {
      const multiItemPrompt = {
        name: 'myservice',
        dataSourceClass: 'MapDsDatasource',
      };

      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: SANDBOX_FILES,
          }),
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
        /export class MyserviceProvider implements Provider<Myservice> {/,
      );
      assert.fileContent(expectedFile, /export interface Myservice {/);
      assert.fileContent(
        expectedFile,
        /import {MapDsDataSource} from '..\/datasources';/,
      );
      assert.fileContent(
        expectedFile,
        /protected dataSource: MapDsDataSource = new MapDsDataSource()/,
      );

      assert.fileContent(expectedFile, /\@inject\('datasources.MapDS'\)/);
      assert.fileContent(expectedFile, /value\(\): Promise\<Myservice\> {/);
      assert.file(INDEX_FILE);
      assert.fileContent(INDEX_FILE, /export \* from '.\/myservice.service';/);
    });
  });
});

// Sandbox constants
const SERVICE_APP_PATH = 'src/services';
const INDEX_FILE = path.join(SANDBOX_PATH, SERVICE_APP_PATH, 'index.ts');
