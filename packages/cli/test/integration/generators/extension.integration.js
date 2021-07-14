// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const generator = path.join(__dirname, '../../../generators/extension');
const props = {
  name: 'my-extension',
  description: 'My extension for LoopBack 4',
};

const tests = require('../lib/project-generator')(
  generator,
  props,
  'extension',
);

describe('generator-loopback4:extension', tests);
