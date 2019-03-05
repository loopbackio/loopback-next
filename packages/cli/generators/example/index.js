// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

('use strict');

const BaseGenerator = require('../../lib/base-generator');
const chalk = require('chalk');
const downloadAndExtractExample = require('./downloader');
const path = require('path');
const utils = require('../../lib/utils');
const fs = require('fs-extra');

const EXAMPLES = {
  todo: 'Tutorial example on how to build an application with LoopBack 4.',
  'todo-list':
    'Continuation of the todo example using relations in LoopBack 4.',
  'hello-world': 'A simple hello-world Application using LoopBack 4.',
  'log-extension': 'An example extension project for LoopBack 4.',
  'rpc-server': 'A basic RPC server using a made-up protocol.',
  'soap-calculator': 'An example on how to integrate SOAP web services',
  'express-composition':
    'A simple Express application that uses LoopBack 4 REST API.',
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
    if (this.shouldExit()) return;
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
      answers => (this.exampleName = answers.name),
    );
  }

  validateExampleName() {
    if (this.shouldExit()) return;
    if (this.exampleName in EXAMPLES) return;
    this.exit(
      `Invalid example name: ${this.exampleName}\n` +
        'Run "lb4 example --help" to print the list of available example names.',
    );
  }

  async downloadAndExtract() {
    if (this.shouldExit()) return false;
    const cwd = process.cwd();
    const absOutDir = await downloadAndExtractExample(this.exampleName, cwd);
    this.outDir = path.relative(cwd, absOutDir);
    fs.rename(
      `${this.outDir}/tsconfig.build.json`,
      `${this.outDir}/tsconfig.json`,
    );
  }

  install() {
    if (this.shouldExit()) return false;
    this.destinationRoot(this.outDir);
    return super.install();
  }

  end() {
    if (!super.end()) return false;
    this.log();
    this.log(`The example was cloned to ${chalk.green(this.outDir)}.`);
    this.log();
  }
};
