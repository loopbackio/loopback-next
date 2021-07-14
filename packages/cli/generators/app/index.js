// Copyright IBM Corp. 2017,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const ProjectGenerator = require('../../lib/project-generator');
const utils = require('../../lib/utils');
const g = require('../../lib/globalize');

module.exports = class AppGenerator extends ProjectGenerator {
  // Note: arguments and options should be defined in the constructor.
  constructor(args, opts) {
    super(args, opts);
    this.buildOptions.push({
      name: 'docker',
      description: g.f('include Dockerfile and .dockerignore'),
    });
    this.buildOptions.push({
      name: 'repositories',
      description: g.f('include repository imports and RepositoryMixin'),
    });
    this.buildOptions.push({
      name: 'services',
      description: g.f('include service-proxy imports and ServiceMixin'),
    });
  }

  _setupGenerator() {
    this.projectType = 'application';

    this.option('applicationName', {
      type: String,
      description: g.f('Application class name'),
    });

    this.option('docker', {
      type: Boolean,
      description: g.f('Include Dockerfile and .dockerignore'),
    });

    this.option('repositories', {
      type: Boolean,
      description: g.f('Include repository imports and RepositoryMixin'),
    });

    this.option('services', {
      type: Boolean,
      description: g.f('Include service-proxy imports and ServiceMixin'),
    });

    this.option('apiconnect', {
      type: Boolean,
      description: g.f('Include ApiConnectComponent'),
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
    if (this.shouldExit()) return;
    const prompts = [
      {
        type: 'input',
        name: 'applicationName',
        message: g.f('Application class name:'),
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

  promptYarnInstall() {
    if (this.shouldExit()) return;
    return super.promptYarnInstall();
  }

  buildAppClassMixins() {
    if (this.shouldExit()) return;
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

    const {docker, repositories} = this.projectInfo || {};
    if (!docker) {
      this.fs.delete(this.destinationPath('Dockerfile'));
      this.fs.delete(this.destinationPath('.dockerignore'));
    }
    if (!repositories) {
      this.fs.delete(this.destinationPath('src/migrate.ts.ejs'));
    }

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
      g.f(
        'Application %s was created in %s.',
        this.projectInfo.name,
        this.projectInfo.outdir,
      ),
    );
    this.log();
    this.log(g.f('Next steps:'));
    this.log();
    this.log('$ cd ' + this.projectInfo.outdir);
    this.log(`$ ${this.options.packageManager || 'npm'} start`);
    this.log();
  }
};
