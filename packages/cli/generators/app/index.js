// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const ProjectGenerator = require('../../lib/project-generator');
const utils = require('../../lib/utils');

module.exports = class AppGenerator extends ProjectGenerator {
  // Note: arguments and options should be defined in the constructor.
  constructor(args, opts) {
    super(args, opts);
  }

  _setupGenerator() {
    this.projectType = 'application';

    this.option('applicationName', {
      type: String,
      description: 'Application class name',
    });

    return super._setupGenerator();
  }

  async setOptions() {
    await super.setOptions();
    if (this.shouldExit()) return;
    if (this.options.applicationName) {
      const clsName = utils.toClassName(this.options.applicationName);
      if (typeof clsName === 'string') {
        this.projectInfo.applicationName = clsName;
      } else if (clsName instanceof Error) {
        throw clsName;
      }
      const msg = utils.validateClassName(clsName);
      if (msg !== true) {
        throw new Error(msg);
      }
    }
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
        when: this.projectInfo.applicationName == null,
      },
    ];

    return this.prompt(prompts).then(props => {
      props.applicationName = utils.toClassName(props.applicationName);
      if (typeof props.applicationName === 'string') {
        this.projectInfo.applicationName = props.applicationName;
      }
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
      'Application %s was created in %s.',
      this.projectInfo.name,
      this.projectInfo.outdir,
    );
    this.log();
    this.log('Next steps:');
    this.log();
    this.log('$ cd ' + this.projectInfo.outdir);
    this.log('$ npm start');
    this.log();
  }
};
