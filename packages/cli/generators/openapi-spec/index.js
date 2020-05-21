// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const BaseGenerator = require('../../lib/base-generator');
const g = require('../../lib/globalize');
const {dump} = require('js-yaml');

module.exports = class OpenApiSpecGenerator extends BaseGenerator {
  // Note: arguments and options should be defined in the constructor.
  constructor(args, opts) {
    super(args, opts);
  }

  _setupGenerator() {
    this.option('out', {
      alias: 'o',
      type: String,
      required: false,
      description: g.f('File name for the OpenAPI spec to be written'),
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

  async promptFileName() {
    if (this.shouldExit()) return;
    if (this.options.out) {
      this.outFile = this.options.out;
      return;
    }
    const prompts = [
      {
        type: 'input',
        name: 'outFile',
        message: g.f('File name for the OpenAPI spec:'),
        default: 'dist/openapi.json',
      },
    ];
    const answers = await this.prompt(prompts);
    this.outFile = answers && answers.outFile;
  }

  async saveSpec() {
    if (this.shouldExit()) return;
    this.log('Loading application %s...', this.packageJson.name);
    // Load the `main` function
    const main = require(this.destinationRoot()).main;
    const app = await main({rest: {listenOnStart: false}});

    // Get the OpenAPI spec
    const spec = await app.restServer.getApiSpec();
    const outFile = this.outFile || 'dist/openapi.json';
    const fileName = this.outFile.toLowerCase();
    if (fileName.endsWith('.yaml') || fileName.endsWith('.yml')) {
      const yaml = dump(spec);
      this.fs.write(outFile, yaml);
    } else {
      this.fs.writeJSON(outFile, spec, null, 2);
    }
    await app.stop();
  }

  async end() {
    this.log('The OpenAPI spec has been saved to %s.', this.outFile);
    await super.end();
  }
};
