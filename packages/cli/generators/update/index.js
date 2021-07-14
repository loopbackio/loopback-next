// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const BaseGenerator = require('../../lib/base-generator');
const g = require('../../lib/globalize');
const link = require('terminal-link');
const chalk = require('chalk');

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

  async checkLoopBackProject() {
    if (this.shouldExit()) return;
    this.updated = await super.checkLoopBackProject();
  }

  async _openChangeLog() {
    if (this.shouldExit()) return;
    if (this.updated !== true) return;
    this.log(chalk.red(g.f('The upgrade may break the current project.')));
    this.log(
      link(
        g.f('Please check out change logs for breaking changes.'),
        'https://loopback.io/doc/en/lb4/changelog.index.html',
      ),
    );
  }

  async end() {
    await this._openChangeLog();
    await super.end();
  }
};
