// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const BaseGenerator = require('./base-generator');
const path = require('path');
const utils = require('./utils');

module.exports = class ProjectGenerator extends BaseGenerator {
  // Note: arguments and options should be defined in the constructor.
  constructor(args, opts) {
    super(args, opts);
    this._setupGenerator();
  }

  _setupGenerator() {
    this.argument('name', {
      type: String,
      required: false,
      description: 'Project name for the ' + this.projectType,
    });

    this.option('description', {
      type: String,
      description: 'Description for the ' + this.projectType,
    });

    this.option('outdir', {
      type: String,
      description: 'Project root directory for the ' + this.projectType,
    });

    this.option('tslint', {
      type: Boolean,
      description: 'Enable tslint',
    });

    this.option('prettier', {
      type: Boolean,
      description: 'Enable prettier',
    });

    this.option('mocha', {
      type: Boolean,
      description: 'Enable mocha',
    });

    this.option('loopbackBuild', {
      type: Boolean,
      description: 'Use @loopback/build',
    });
  }

  setOptions() {
    this.projectInfo = {projectType: this.projectType};
    [
      'name',
      'description',
      'outdir',
      'componentName',
      'tslint',
      'prettier',
      'mocha',
      'loopbackBuild',
    ].forEach(n => {
      if (this.options[n]) {
        this.projectInfo[n] = this.options[n];
      }
    });
  }

  promptProjectName() {
    if (this.shouldExit()) return false;
    const prompts = [
      {
        type: 'input',
        name: 'name',
        message: 'Project name:',
        when: this.projectInfo.name == null,
        default: this.options.name || this.appname,
      },
      {
        type: 'input',
        name: 'description',
        message: 'Project description:',
        when: this.projectInfo.description == null,
        default: this.options.name || this.appname,
      },
    ];

    return this.prompt(prompts).then(props => {
      Object.assign(this.projectInfo, props);
    });
  }

  promptProjectDir() {
    if (this.shouldExit()) return false;
    const prompts = [
      {
        type: 'input',
        name: 'outdir',
        message: 'Project root directory:',
        when:
          this.projectInfo.outdir == null ||
          // prompts if option was set to a directory that already exists
          utils.validateyNotExisting(this.projectInfo.outdir) !== true,
        validate: utils.validateyNotExisting,
        default: this.projectInfo.name,
      },
    ];

    return this.prompt(prompts).then(props => {
      Object.assign(this.projectInfo, props);
    });
  }

  promptOptions() {
    if (this.shouldExit()) return false;
    const choices = [];
    ['tslint', 'prettier', 'mocha', 'loopbackBuild'].forEach(f => {
      if (!this.options[f]) {
        choices.push({
          name: 'Enable ' + f,
          key: f,
          checked: true,
        });
      }
    });
    const prompts = [
      {
        name: 'settings',
        message: 'Select project build settings: ',
        type: 'checkbox',
        choices: choices,
        // Skip if all features are enabled by cli options
        when: choices.length > 0,
      },
    ];
    return this.prompt(prompts).then(props => {
      const settings = props.settings || choices.map(c => c.name);
      const features = choices.map(c => {
        return {
          key: c.key,
          value: settings.indexOf(c.name) !== -1,
        };
      });
      features.forEach(f => (this.projectInfo[f.key] = f.value));
    });
  }

  scaffold() {
    if (this.shouldExit()) return false;
    this.destinationRoot(this.projectInfo.outdir);

    // First copy common files from ../../project/templates
    this.fs.copyTpl(
      this.templatePath('../../project/templates/**/*'),
      this.destinationPath(''),
      {
        project: this.projectInfo,
      },
      {},
      {globOptions: {dot: true}}
    );

    // Rename `_.gitignore` back to `.gitignore`.
    // Please note `.gitignore` will be renamed to `.npmignore` during publish
    // if it's there in the templates.
    this.fs.move(
      this.destinationPath('_.gitignore'),
      this.destinationPath('.gitignore')
    );

    // Copy project type specific files from ./templates
    this.fs.copyTpl(
      this.templatePath('**/*'),
      this.destinationPath(''),
      {
        project: this.projectInfo,
      },
      {},
      {globOptions: {dot: true}}
    );

    if (!this.projectInfo.tslint) {
      this.fs.delete(this.destinationPath('tslint.*json'));
    }

    if (!this.projectInfo.prettier) {
      this.fs.delete(this.destinationPath('.prettier*'));
    }

    if (!this.projectInfo.loopbackBuild) {
      this.fs.move(
        this.destinationPath('package.plain.json'),
        this.destinationPath('package.json')
      );
    } else {
      this.fs.delete(this.destinationPath('package.plain.json'));
    }

    if (!this.projectInfo.mocha) {
      this.fs.delete(this.destinationPath('test/mocha.opts'));
    }
  }

  install() {
    if (this.shouldExit()) return false;
    this.npmInstall(null, {}, {cwd: this.destinationRoot()});
  }
};
