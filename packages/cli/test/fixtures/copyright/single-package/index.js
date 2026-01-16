// Copyright ACME Inc. 2020,2024. All Rights Reserved.
// Node module: myapp
// This file is licensed under the ISC License.
// License text available at https://www.isc.org/licenses/

// Use the same set of files (except index.js) in this folder
const files = require('../index')(__dirname);

// add node_modules/third-party.js
files.push({
  path: 'node_modules',
  file: 'third-party.js',
  content: `module.exports = {}`,
});

files.push({
  path: '',
  file: 'license-header.template',
  content: `=============================================================================
Licensed Materials - Property of <%= owner %>
(C) Copyright <%= owner %> <%= years %>
US Government Users Restricted Rights - Use, duplication or disclosure
restricted by GSA ADP Schedule Contract with <%= owner %>.
=============================================================================`,
});

exports.SANDBOX_FILES = files;
