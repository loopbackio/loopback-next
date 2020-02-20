// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const utils = require('../../lib/utils');

const ProjectGenerator = require('../../lib/project-generator');
const g = require('../../lib/globalize');

module.exports = class ExtensionGenerator extends ProjectGenerator {
  // Note: arguments and options should be defined in the constructor.
  constructor(args, opts) {
    super(args, opts);
  }

  _setupGenerator() {
    this.projectType = 'extension';

    this.option('componentName', {
      type: String,
      description: g.f('Component name'),
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

  promptComponent() {
    if (this.shouldExit()) return false;
    const prompts = [
      {
        type: 'input',
        name: 'componentName',
        message: g.f('Component class name:'),
        when: this.projectInfo.componentName == null,
        default: utils.toClassName(this.projectInfo.name) + 'Component',
      },
    ];

    return this.prompt(prompts).then(props => {
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
    return super.end();
  }
};
