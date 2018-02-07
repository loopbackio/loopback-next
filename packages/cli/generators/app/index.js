// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const ProjectGenerator = require('../../lib/project-generator');
const utils = require('../../lib/utils');

module.exports = class extends ProjectGenerator {
  // Note: arguments and options should be defined in the constructor.
  constructor(args, opts) {
    super(args, opts);
    this.buildOptions = [
      'tslint',
      'prettier',
      'mocha',
      'loopbackBuild',
      'loopbackBoot',
    ];
  }

  _setupGenerator() {
    this.projectType = 'application';

    this.option('applicationName', {
      type: String,
      description: 'Application name',
    });

    this.option('loopbackBoot', {
      type: Boolean,
      description: 'Use @loopback/boot',
    });

    return super._setupGenerator();
  }

  setOptions() {
    return super.setOptions();
  }

  promptProjectName() {
    return super.promptProjectName();
  }

  promptProjectDir() {
    return super.promptProjectDir();
  }

  promptApplication() {
    if (this.shouldExit()) return false;
    const prompts = [
      {
        type: 'input',
        name: 'applicationName',
        message: 'Application class name:',
        default: utils.pascalCase(this.projectInfo.name) + 'Application',
        validate: utils.validateClassName,
      },
    ];

    return this.prompt(prompts).then(props => {
      props.applicationName = utils.toClassName(props.applicationName);
      Object.assign(this.projectInfo, props);
    });
  }

  promptOptions() {
    return super.promptOptions();
  }

  scaffold() {
    return super.scaffold();
  }

  install() {
    return super.install();
  }

  end() {
    if (!super.end()) return false;
    this.log();
    this.log(
      'Application %s is now created in %s.',
      this.projectInfo.name,
      this.projectInfo.outdir
    );
    this.log();
    this.log('Next steps:');
    this.log();
    this.log('$ cd ' + this.projectInfo.outdir);
    this.log('$ npm start');
    this.log();
  }
};
