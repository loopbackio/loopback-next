// Copyright IBM Corp. 2017,2020. All Rights Reserved.
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
    if (this.shouldExit()) return;
    return super.setOptions();
  }

  promptProjectName() {
    if (this.shouldExit()) return;
    return super.promptProjectName();
  }

  promptProjectDir() {
    if (this.shouldExit()) return;
    return super.promptProjectDir();
  }

  promptComponent() {
    if (this.shouldExit()) return;
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
    if (this.shouldExit()) return;
    return super.promptOptions();
  }

  promptYarnInstall() {
    if (this.shouldExit()) return;
    return super.promptYarnInstall();
  }

  scaffold() {
    if (this.projectInfo) {
      this.projectInfo.optionsInterface = `${this.projectInfo.componentName}Options`;
      this.projectInfo.bindingsNamespace = `${this.projectInfo.componentName}Bindings`;
      const uppercaseUnderscore = this.projectInfo.name
        .toUpperCase()
        .replace(/\W/g, '_');
      this.projectInfo.defaultOptions = `DEFAULT_${uppercaseUnderscore}_OPTIONS`;
    }
    return super.scaffold();
  }

  install() {
    return super.install();
  }

  end() {
    return super.end();
  }
};
