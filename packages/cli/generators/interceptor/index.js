// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const ArtifactGenerator = require('../../lib/artifact-generator');
const debug = require('../../lib/debug')('interceptor-generator');
const inspect = require('util').inspect;
const path = require('path');
const utils = require('../../lib/utils');

const SCRIPT_TEMPLATE = 'interceptor-template.ts.ejs';

module.exports = class InterceptorGenerator extends ArtifactGenerator {
  // Note: arguments and options should be defined in the constructor.
  constructor(args, opts) {
    super(args, opts);
  }

  _setupGenerator() {
    this.option('global', {
      description: 'Flag to indicate a global interceptor',
      required: false,
      type: Boolean,
    });

    this.option('group', {
      description: 'Group name for ordering the global interceptor',
      required: false,
      type: String,
    });

    this.artifactInfo = {
      type: 'interceptor',
      rootDir: utils.sourceRootDir,
    };

    this.artifactInfo.outDir = path.resolve(
      this.artifactInfo.rootDir,
      utils.interceptorsDir,
    );

    this.artifactInfo.defaultTemplate = SCRIPT_TEMPLATE;

    return super._setupGenerator();
  }

  setOptions() {
    return super.setOptions();
  }

  checkLoopBackProject() {
    if (this.shouldExit()) return;
    return super.checkLoopBackProject();
  }

  /**
   * Ask for Service Name
   */
  async promptArtifactName() {
    debug('Prompting for interceptor name');
    if (this.shouldExit()) return;

    if (this.options.name) {
      Object.assign(this.artifactInfo, {name: this.options.name});
    }

    const prompts = [
      {
        type: 'input',
        name: 'name',
        // capitalization
        message: utils.toClassName(this.artifactInfo.type) + ' name:',
        when: !this.artifactInfo.name,
        validate: utils.validateClassName,
      },
    ];
    return this.prompt(prompts).then(props => {
      Object.assign(this.artifactInfo, props);
      return props;
    });
  }

  async promptGlobal() {
    debug('Prompting for global interceptor flag');
    if (this.shouldExit()) return;

    if (this.options.global != null) {
      Object.assign(this.artifactInfo, {isGlobal: !!this.options.global});
      return;
    }

    // --group hints global
    if (this.options.group != null) {
      Object.assign(this.artifactInfo, {isGlobal: true});
      return;
    }

    const prompts = [
      {
        type: 'confirm',
        name: 'isGlobal',
        message: 'Is it a global interceptor?',
        default: true,
      },
    ];
    return this.prompt(prompts).then(props => {
      Object.assign(this.artifactInfo, props);
      return props;
    });
  }

  async promptInterceptorGroup() {
    if (!this.artifactInfo.isGlobal) return;
    debug('Prompting for global interceptor group');
    if (this.shouldExit()) return;

    if (this.options.group) {
      Object.assign(this.artifactInfo, {group: this.options.group});
      return;
    }

    const note =
      'Global interceptors are sorted by the order of an array of' +
      ' group names bound to ContextBindings.GLOBAL_INTERCEPTOR_ORDERED_GROUPS.' +
      ' See https://loopback.io/doc/en/lb4/Interceptors.html#order-of-invocation-for-interceptors.';

    this.log();
    this.log(note);
    this.log();

    const prompts = [
      {
        type: 'input',
        name: 'group',
        // capitalization
        message: `Group name for the global interceptor: ('')`,
      },
    ];
    return this.prompt(prompts).then(props => {
      Object.assign(this.artifactInfo, props);
      return props;
    });
  }

  scaffold() {
    if (this.shouldExit()) return false;

    // Setting up data for templates
    this.artifactInfo.className =
      utils.toClassName(this.artifactInfo.name) + 'Interceptor';
    this.artifactInfo.fileName = utils.toFileName(this.artifactInfo.name);

    Object.assign(this.artifactInfo, {
      outFile: utils.getInterceptorFileName(this.artifactInfo.name),
    });

    const source = this.templatePath(this.artifactInfo.defaultTemplate);

    const dest = this.destinationPath(
      path.join(this.artifactInfo.outDir, this.artifactInfo.outFile),
    );

    debug(`artifactInfo: ${inspect(this.artifactInfo)}`);
    debug(`Copying artifact to: ${dest}`);

    this.copyTemplatedFiles(source, dest, this.artifactInfo);
    return;
  }

  async end() {
    await super.end();
  }
};
