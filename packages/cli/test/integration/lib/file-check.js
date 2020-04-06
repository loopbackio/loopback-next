// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const assert = require('yeoman-assert');

// Checks to ensure expected files exist with the current file contents
function basicModelFileChecks(expectedModelFile, expectedIndexFile) {
  assert.file(expectedModelFile);
  assert.file(expectedIndexFile);

  // Actual Model File
  assert.fileContent(
    expectedModelFile,
    /import {Entity, model, property} from '@loopback\/repository';/,
  );
  assert.fileContent(expectedModelFile, /@model/);
  assert.fileContent(expectedModelFile, /export class Test extends Entity {/);
  assert.fileContent(
    expectedModelFile,
    /constructor\(data\?\: Partial<Test>\) {/,
  );
  assert.fileContent(expectedModelFile, /super\(data\)/);

  // Actual Index File
  assert.fileContent(expectedIndexFile, /export \* from '.\/test.model';/);
}

module.exports = {
  basicModelFileChecks,
};
