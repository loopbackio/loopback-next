// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

('use strict');

const BaseGenerator = require('../../lib/base-generator');
const chalk = require('chalk');
const cloneExampleFromGitHub = require('./clone-example');
const path = require('path');
const utils = require('../../lib/utils');

const EXAMPLES = {
  codehub: 'A GitHub-like application we used to use to model LB4 API.',
  'getting-started':
    'An application and tutorial on how to build with LoopBack 4.',
};
Object.freeze(EXAMPLES);

module.exports = class extends BaseGenerator {
  static getAllExamples() {
    return EXAMPLES;
  }

  // Note: arguments and options should be defined in the constructor.
  constructor(args, opts) {
    super(args, opts);
  }

  _setupGenerator() {
    this.projectType = 'example';
    this.argument('example-name', {
      type: String,
      description: 'Name of the example to clone',
      required: false,
    });

    return super._setupGenerator();
  }

  help() {
    const examplesHelp = Object.keys(EXAMPLES)
      .map(name => `  ${name}: ${EXAMPLES[name]}`)
      .join('\n');

    return super.help() + `\nAvailable examples:\n${examplesHelp}\n`;
  }

  _describeExamples() {}

  promptExampleName() {
    if (this.options['example-name']) {
      this.exampleName = this.options['example-name'];
      return;
    }

    const choices = Object.keys(EXAMPLES).map(k => {
      return {
        name: `${k}: ${EXAMPLES[k]}`,
        value: `${k}`,
        short: `${k}`,
      };
    });
    const prompts = [
      {
        name: 'name',
        message: 'What example would you like to clone?',
        type: 'list',
        choices,
      },
    ];
    return this.prompt(prompts).then(
      answers => (this.exampleName = answers.name)
    );
  }

  validateExampleName() {
    if (this.exampleName in EXAMPLES) return;
    this.exit(
      `Invalid example name: ${this.exampleName}\n` +
        'Run "lb4 example --help" to print the list of available example names.'
    );
  }

  cloneExampleFromGitHub() {
    if (this.shouldExit()) return false;
    const cwd = process.cwd();
    return cloneExampleFromGitHub(this.exampleName, cwd).then(o => {
      this.outDir = path.relative(cwd, o);
    });
  }

  end() {
    if (!super.end()) return false;
    this.log();
    this.log(`The example was cloned to ${chalk.green(this.outDir)}.`);
    this.log();
  }
};
