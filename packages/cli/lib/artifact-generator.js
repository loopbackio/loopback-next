// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const Generator = require('yeoman-generator');
const utils = require('./utils');
const Conflicter = require('./conflicter.js');

module.exports = class extends Generator {
  // Note: arguments and options should be defined in the constructor.
  constructor(args, opts) {
    super(args, opts);
    this.conflicter = new Conflicter(this.env.adapter, this.options.force);
    this._setupGenerator();
  }

  _setupGenerator() {
    this.artifactInfo.name = this.args[0];
    this.artifactInfo.defaultName = 'new';
    this.argument('name', {
      type: String,
      required: false,
      description: 'Name for the ' + this.artifactType,
    });
  }

  /**
   * Override the usage text by replacing `yo loopback4:` with `lb4 `.
   */
  usage() {
    const text = super.usage();
    return text.replace(/^yo loopback4:/g, 'lb4 ');
  }

  promptArtifactName() {
    const prompts = [
      {
        type: 'input',
        name: 'name',
        message: utils.toClassName(this.artifactInfo.artifactType) + ' name:', // capitalization
        when: this.artifactInfo.name == undefined,
        default: utils.toClassName(this.artifactInfo.defaultName),
        validate: utils.validateClassName,
      },
    ];

    return this.prompt(prompts).then(props => {
      Object.assign(this.artifactInfo, props);
    });
  }

  scaffold() {
    this.destinationRoot(this.artifactInfo.outdir);
    const originalName = this.artifactInfo.name;

    // Capitalize class name
    this.artifactInfo.name = utils.toClassName(this.artifactInfo.name);

    // Copy template files from ./templates
    this.fs.copyTpl(
      this.templatePath('new.' + this.artifactInfo.artifactType + '.ts'),
      // name.artifactName.ts (ex: new.controller.ts)
      this.destinationPath(
        utils.toFileName(originalName) +
          '.' +
          this.artifactInfo.artifactType +
          '.ts'
      ),
      this.artifactInfo,
      {},
      {globOptions: {dot: true}}
    );
  }
};
