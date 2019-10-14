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

describe('lb4 service (local)', () => {
  beforeEach('reset sandbox', async () => {
    await sandbox.reset();
  });

  describe('invalid generation of services', () => {
    it('does not run with invalid service type', async () => {
      return expect(
        testUtils
          .executeGenerator(generator)
          .withArguments('myService --type xyz')
          .inDir(SANDBOX_PATH, () => testUtils.givenLBProject(SANDBOX_PATH)),
      ).to.be.rejectedWith(/Invalid service type\: xyz/);
    });
  });

  describe('valid generation of services', () => {
    it('generates a basic local service class from command line arguments', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withArguments('myTest --type class');
      const expectedFile = path.join(
        SANDBOX_PATH,
        SERVICE_APP_PATH,
        'my-test.service.ts',
      );
      assert.file(expectedFile);
      assert.fileContent(expectedFile, /export class MyTestService {/);
      assert.file(INDEX_FILE);
      assert.fileContent(INDEX_FILE, /export \* from '.\/my-test.service';/);
    });

    it('generates a basic local service class from the prompts', async () => {
      const multiItemPrompt = {
        name: 'myTest',
        serviceType: 'class',
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
        'my-test.service.ts',
      );
      assert.file(expectedFile);
      assert.fileContent(expectedFile, /export class MyTestService {/);
      assert.file(INDEX_FILE);
      assert.fileContent(INDEX_FILE, /export \* from '.\/my-test.service';/);
    });

    it('generates a basic local service provider from command line arguments', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withArguments('myService --type provider');
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
      assert.fileContent(expectedFile, /value\(\) {/);
      assert.file(INDEX_FILE);
      assert.fileContent(INDEX_FILE, /export \* from '.\/my-service.service';/);
    });

    it('generates a basic local service provider from the prompts', async () => {
      const multiItemPrompt = {
        name: 'myService',
        serviceType: 'provider',
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
      assert.fileContent(expectedFile, /value\(\) {/);
      assert.file(INDEX_FILE);
      assert.fileContent(INDEX_FILE, /export \* from '.\/my-service.service';/);
    });
  });
});

// Sandbox constants
const SERVICE_APP_PATH = 'src/services';
const INDEX_FILE = path.join(SANDBOX_PATH, SERVICE_APP_PATH, 'index.ts');
