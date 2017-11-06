// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const generator = path.join(__dirname, '../generators/app');
const props = {
  name: 'my-app',
  description: 'My app for LoopBack 4',
};

const tests = require('./project')(generator, props, 'application');

describe('generator-loopback4:app', tests);
