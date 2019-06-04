// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const ArtifactGenerator = require('../../lib/artifact-generator');
const debug = require('../../lib/debug')('observer-generator');
const inspect = require('util').inspect;
const path = require('path');
const utils = require('../../lib/utils');

const SCRIPT_TEMPLATE = 'observer-template.ts.ejs';

module.exports = class ObserverGenerator extends ArtifactGenerator {
  // Note: arguments and options should be defined in the constructor.
  constructor(args, opts) {
    super(args, opts);
  }

  _setupGenerator() {
    this.option('group', {
      description: 'Name of the observer group for ordering',
      required: false,
      type: String,
    });

    this.artifactInfo = {
      type: 'observer',
      rootDir: utils.sourceRootDir,
    };

    this.artifactInfo.outDir = path.resolve(
      this.artifactInfo.rootDir,
      utils.observersDir,
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
    debug('Prompting for observer name');
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

  async promptObserverGroup() {
    debug('Prompting for observer group');
    if (this.shouldExit()) return;

    if (this.options.group) {
      Object.assign(this.artifactInfo, {group: this.options.group});
    }

    const prompts = [
      {
        type: 'input',
        name: 'group',
        // capitalization
        message: utils.toClassName(this.artifactInfo.type) + ' group:',
        default: '',
        when: !this.artifactInfo.group,
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
      utils.toClassName(this.artifactInfo.name) + 'Observer';
    this.artifactInfo.fileName = utils.toFileName(this.artifactInfo.name);

    Object.assign(this.artifactInfo, {
      outFile: utils.getObserverFileName(this.artifactInfo.name),
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
