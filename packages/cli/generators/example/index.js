// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const BaseGenerator = require('../../lib/base-generator');
const chalk = require('chalk');
const downloadAndExtractExample = require('./downloader');
const path = require('path');
const fs = require('fs-extra');
const g = require('../../lib/globalize');

const EXAMPLES = {
  todo: g.f('Tutorial example on how to build an application with LoopBack 4.'),
  'todo-list': g.f(
    'Continuation of the todo example using relations in LoopBack 4.',
  ),
  'hello-world': g.f('A simple hello-world application using LoopBack 4.'),
  'log-extension': g.f('An example extension project for LoopBack 4.'),
  'rpc-server': g.f('A basic RPC server using a made-up protocol.'),
  'soap-calculator': g.f('An example on how to integrate SOAP web services.'),
  'express-composition': g.f(
    'A simple Express application that uses LoopBack 4 REST API.',
  ),
  context: g.f('Standalone examples showing how to use @loopback/context.'),
  'greeter-extension': g.f(
    'An example showing how to implement the extension point/extension pattern.',
  ),
  'greeting-app': g.f(
    'An example showing how to compose an application from component and ' +
      'controllers, interceptors, and observers.',
  ),
  'lb3-application': g.f(
    'An example LoopBack 3 application mounted in a LoopBack 4 project.',
  ),
  'rest-crud': g.f(
    'A simplified version of the Todo example that only requires a model and ' +
      'a datasource.',
  ),
  'file-transfer': g.f(
    'An example showing how to expose APIs to upload/download files.',
  ),
  'access-control-migration': g.f(
    'An access control example migrated from the LoopBack 3 repository ' +
      'loopback-example-access-control.',
  ),
  'metrics-prometheus': g.f(
    'An example illustrating metrics using Prometheus.',
  ),
  'validation-app': g.f('An example demonstrating how to add validations.'),
  'multi-tenancy': g.f(
    'An example application to demonstrate how to implement multi-tenancy with LoopBack 4.',
  ),
  'passport-login': g.f(
    'An example implmenting authentication in a LoopBack application using Passport modules.',
  ),
  'todo-jwt': g.f('A modified Todo application with JWT authentication.'),
  webpack: g.f('An example to bundle @loopback/core using webpack.'),
  graphql: g.f('An example to demonstrate GraphQL integration.'),
  socketio: g.f('A basic implementation of Socket.IO'),
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
      description: g.f('Name of the example to clone'),
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
        message: g.f('What example would you like to clone?'),
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
      g.f(
        'Invalid example name: %s\n' +
          'Run "lb4 example --help" to print the list of available example names.',
        this.exampleName,
      ),
    );
  }

  async downloadAndExtract() {
    if (this.shouldExit()) return false;
    const cwd = process.cwd();
    const absOutDir = await downloadAndExtractExample(this.exampleName, cwd);
    this.outDir = path.relative(cwd, absOutDir);
    const tsconfig = path.join(absOutDir, 'tsconfig.json');

    // Support older versions of examples that are using `tsconfig.build.json`
    const tsBuildConfig = path.join(absOutDir, 'tsconfig.build.json');
    const exists = await fs.pathExists(tsconfig);
    if (!exists) {
      return fs.rename(tsBuildConfig, tsconfig);
    }

    // Recent versions of examples are using project references inside monorepo,
    // see https://github.com/loopbackio/loopback-next/pull/5155
    // We must switch to standalone mode (no project references) when the code
    // was checked out outside of our monorepo.
    const tsconfigContent = await fs.readJson(tsconfig);
    delete tsconfigContent.references;
    tsconfigContent.compilerOptions.composite = false;
    await fs.writeJson(tsconfig, tsconfigContent);
  }

  install() {
    if (this.shouldExit()) return false;
    this.destinationRoot(this.outDir);
    return super.install();
  }

  async end() {
    await super.end();
    this.log();
    this.log(g.f('The example was cloned to %s.', chalk.green(this.outDir)));
    this.log();
  }
};
