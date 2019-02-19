// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const assert = require('yeoman-assert');
const testlab = require('@loopback/testlab');
const fs = require('fs');

const expect = testlab.expect;
const TestSandbox = testlab.TestSandbox;

const generator = path.join(__dirname, '../../../generators/relation');
const SANDBOX_FILES = require('../../fixtures/relation').SANDBOX_FILES;
const testUtils = require('../../test-utils');

// Test Sandbox
const SANDBOX_PATH = path.resolve(__dirname, '..', '.sandbox');
const MODEL_APP_PATH = 'src/models';
const sandbox = new TestSandbox(SANDBOX_PATH);

describe('lb4 relation', function() {
  // tslint:disable-next-line:no-invalid-this
  this.timeout(30000);

  beforeEach('reset sandbox', async () => {
    await sandbox.reset();
  });

  // special cases regardless of the repository type
  describe('generate model relation', () => {
    it('generates lb4 relation', async () => {
      const multiItemPrompt = {
        relationType: 'hasMany',
        sourceModel: 'Customer',
        destinationModel: 'Order',
        relationName: 'orders',
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
        MODEL_APP_PATH,
        'customer.model.ts',
      );

      assert.file(expectedFile);
      assert.fileContent(
        expectedFile,
        /import \{ Order \} from "\.\/order.model";/,
      );

      assert.fileContent(
        expectedFile,
        /@hasMany\(\(\) => Order, \{ keyTo: 'customerId' \}\)/,
      );

      assert.fileContent(expectedFile, /orders: Order\[\];/);
    });
  });
});
