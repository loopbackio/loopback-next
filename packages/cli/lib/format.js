// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const prettier = require('prettier');

module.exports = function(codeString) {
  // Can load in prettier options from prettierrc and apply those
  // using prettier default right now.
  // {parser: 'typescript', ...options}
  return prettier.format(codeString, {parser: 'typescript'});
};
