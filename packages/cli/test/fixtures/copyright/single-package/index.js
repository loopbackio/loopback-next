// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// Use the same set of files (except index.js) in this folder
const files = require('../index')(__dirname);

// add node_modules/third-party.js
files.push({
  path: 'node_modules',
  file: 'third-party.js',
  content: `module.exports = {}`,
});
exports.SANDBOX_FILES = files;
