// Copyright IBM Corp. 2017,2019. All Rights Reserved.
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
    this.buildOptions.push({
      name: 'docker',
      description: 'include Dockerfile and .dockerignore',
    });
    this.buildOptions.push({
      name: 'repositories',
      description: 'include repository imports and RepositoryMixin',
    });
    this.buildOptions.push({
      name: 'services',
      description: 'include service-proxy imports and ServiceMixin',
    });
  }

  _setupGenerator() {
    this.projectType = 'application';

    this.option('applicationName', {
      type: String,
      description: 'Application class name',
    });

    this.option('docker', {
      type: Boolean,
      description: 'Include Dockerfile and .dockerignore',
    });

    this.option('repositories', {
      type: Boolean,
      description: 'Include repository imports and RepositoryMixin',
    });

    this.option('services', {
      type: Boolean,
      description: 'Include service-proxy imports and ServiceMixin',
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
    if (this.shouldExit()) return;
    return super.promptProjectName();
  }

  promptProjectDir() {
    if (this.shouldExit()) return;
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
    if (this.shouldExit()) return;
    return super.promptOptions();
  }

  buildAppClassMixins() {
    if (this.shouldExit()) return false;
    const {repositories, services} = this.projectInfo || {};
    if (!repositories && !services) return;

    let appClassWithMixins = 'RestApplication';
    if (repositories) {
      appClassWithMixins = `RepositoryMixin(${appClassWithMixins})`;
    }
    if (services) {
      appClassWithMixins = `ServiceMixin(${appClassWithMixins})`;
    }

    this.projectInfo.appClassWithMixins = appClassWithMixins;
  }

  scaffold() {
    const result = super.scaffold();
    if (this.shouldExit()) return result;

    const {docker} = this.projectInfo || {};
    if (docker) return result;

    this.fs.delete(this.destinationPath('Dockerfile'));
    this.fs.delete(this.destinationPath('.dockerignore'));
    return result;
  }

  install() {
    return super.install();
  }

  async end() {
    await super.end();
    if (this.shouldExit()) return;
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
