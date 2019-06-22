// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const pacote = require('pacote');

module.exports = async function downloadAndExtractExample(exampleName, cwd) {
  const packageSpec = `@loopback/example-${exampleName}`;
  const outDir = path.join(cwd, `loopback4-example-${exampleName}`);
  await pacote.extract(packageSpec, outDir);
  return outDir;
};
