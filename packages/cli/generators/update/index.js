// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const BaseGenerator = require('../../lib/base-generator');
const g = require('../../lib/globalize');

module.exports = class UpdateGenerator extends BaseGenerator {
  // Note: arguments and options should be defined in the constructor.
  constructor(args, opts) {
    super(args, opts);
    this.command = 'update';
  }

  _setupGenerator() {
    this.option('semver', {
      type: Boolean,
      required: false,
      default: false,
      description: g.f('Check version compatibility using semver semantics'),
    });
    return super._setupGenerator();
  }

  setOptions() {
    return super.setOptions();
  }

  checkLoopBackProject() {
    if (this.shouldExit()) return;
    return super.checkLoopBackProject();
  }

  async end() {
    await super.end();
  }
};
