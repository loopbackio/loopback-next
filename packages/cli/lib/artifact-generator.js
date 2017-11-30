// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const Generator = require('yeoman-generator');
const utils = require('./utils');
const StatusConflicter = utils.StatusConflicter;

module.exports = class ArtifactGenerator extends Generator {
  // Note: arguments and options should be defined in the constructor.
  constructor(args, opts) {
    super(args, opts);
    this._setupGenerator();
  }

  _setupGenerator() {
    this.argument('name', {
      type: String,
      required: false,
      description: 'Name for the ' + this.artifactInfo.type,
    });
    // argument validation
    if (this.args.length) {
      const validationMsg = utils.validateClassName(this.args[0]);
      if (typeof validationMsg === 'string') throw new Error(validationMsg);
    }
    this.artifactInfo.name = this.args[0];
    this.artifactInfo.defaultName = 'new';
    this.conflicter = new StatusConflicter(
      this.env.adapter,
      this.options.force
    );
  }

  /**
   * Override the usage text by replacing `yo loopback4:` with `lb4 `.
   */
  usage() {
    const text = super.usage();
    return text.replace(/^yo loopback4:/g, 'lb4 ');
  }

  /**
   * Checks if current directory is a LoopBack project by checking for
   * keyword 'loopback' under 'keywords' attribute in package.json.
   * 'keywords' is an array
   */
  checkLoopBackProject() {
    const pkg = this.fs.readJSON(this.destinationPath('package.json'));
    const key = 'loopback';
    if (!pkg) throw new Error('unable to load package.json');
    if (!pkg.keywords || !pkg.keywords.includes(key))
      throw new Error('keywords does not map to loopback in package.json');
    return;
  }

  promptArtifactName() {
    const prompts = [
      {
        type: 'input',
        name: 'name',
        message: utils.toClassName(this.artifactInfo.type) + ' name:', // capitalization
        when: this.artifactInfo.name === undefined,
        default: this.artifactInfo.defaultName,
        validate: utils.validateClassName,
      },
    ];

    return this.prompt(prompts).then(props => {
      Object.assign(this.artifactInfo, props);
    });
  }

  scaffold() {
    // Capitalize class name
    this.artifactInfo.name = utils.toClassName(this.artifactInfo.name);

    // Copy template files from ./templates
    // Renaming of the files should be done in the generator inheriting from this one
    this.fs.copyTpl(
      this.templatePath('**/*'),
      this.destinationPath(),
      this.artifactInfo,
      {},
      {globOptions: {dot: true}}
    );
    return;
  }
};
