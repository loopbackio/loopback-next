// Copyright ACME Inc. 2020. All Rights Reserved.
// Node module: myapp
// This file is licensed under the ISC License.
// License text available at https://www.isc.org/downloads/software-support-policy/isc-license/

// Use the same set of files (except index.js) in this folder
const files = require('../index')(__dirname);

// add node_modules/third-party.js
files.push({
  path: 'node_modules',
  file: 'third-party.js',
  content: `module.exports = {}`,
});
exports.SANDBOX_FILES = files;
