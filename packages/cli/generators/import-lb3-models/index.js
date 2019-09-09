// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const chalk = require('chalk');
const path = require('path');
const BaseGenerator = require('../../lib/base-generator');
const modelUtils = require('../../lib/model-discoverer');
const debug = require('../../lib/debug')('import-lb3-models');
const utils = require('../../lib/utils');
const {loadLb3App} = require('./lb3app-loader');
const {importLb3ModelDefinition} = require('./migrate-model');
const {canImportModelName} = require('./model-names');

module.exports = class Lb3ModelImporter extends BaseGenerator {
  constructor(args, opts) {
    super(args, opts);

    this.argument('lb3app', {
      type: String,
      required: true,
      description:
        'Path to your LoopBack 3.x application. ' +
        'This can be a project directory (e.g. "my-lb3-app") or ' +
        'the server file (e.g. "my-lb3-app/server/server.js").',
    });

    this.option('outDir', {
      type: String,
      description: 'Directory where to write the generated source file',
      default: 'src/models',
    });
  }

  async processOptions() {
    this.sourceAppDir = this.args[0];
    this.artifactInfo.outDir = this.options.outDir;
    this.artifactInfo.relPath = path.relative(
      this.destinationPath(),
      this.artifactInfo.outDir,
    );
    return super.setOptions();
  }

  async logExperimentalStatus() {
    this.log(
      chalk.red(`
WARNING: This command is experimental and not feature-complete yet.
Learn more at https://loopback.io/doc/en/lb4/Importing-LB3-models.html
`),
    );
  }

  /**
   * Ensure CLI is being run in a LoopBack 4 project.
   */
  checkLoopBackProject() {
    if (this.shouldExit()) return;
    return super.checkLoopBackProject();
  }

  async loadTheApp() {
    this.lb3app = await loadLb3App(this.sourceAppDir);
    this.modelRegistry = this.lb3app.registry.modelBuilder.models;
  }

  async promptModels() {
    const modelNames = Object.keys(this.modelRegistry).filter(
      canImportModelName,
    );

    debug('Available LB3 models', modelNames);

    const prompts = [
      {
        name: 'modelNames',
        message: 'Select models to import:',
        type: 'checkbox',
        choices: modelNames,
        validate: result => !!result.length,
        // TODO: add a CLI flag to supply these names programmatically
      },
    ];

    const answers = await this.prompt(prompts);
    debug('Models chosen:', answers.modelNames);
    this.modelNames = answers.modelNames;
  }

  async migrateSelectedModels() {
    if (this.shouldExit()) return;
    this.modelFiles = [];

    try {
      for (const name of this.modelNames) {
        await this._migrateSingleModel(name);
      }
    } catch (err) {
      if (err.exit) {
        this.exit(err.message);
      } else {
        throw err;
      }
    }
  }

  async _migrateSingleModel(name) {
    utils.logClassCreation('model', 'models', name, this.log.bind(this));
    const modelCtor = this.modelRegistry[name];
    if (typeof modelCtor !== 'function') {
      const availableModels = Object.keys(this.modelRegistry)
        .filter(canImportModelName)
        .join(', ');

      this.exit(
        `Unknown model name ${name}. Available models: ${availableModels}.`,
      );
      return;
    }

    const templateData = importLb3ModelDefinition(
      modelCtor,
      this.log.bind(this),
    );
    debug('LB4 model data', templateData);

    const fileName = utils.getModelFileName(name);
    const fullTargetPath = path.resolve(this.artifactInfo.relPath, fileName);
    debug('Model %s output file', name, fullTargetPath);

    this.copyTemplatedFiles(
      modelUtils.MODEL_TEMPLATE_PATH,
      fullTargetPath,
      templateData,
    );

    this.modelFiles.push(fileName);
  }

  /**
   * Iterate through all the models we have discovered and scaffold
   */
  async scaffold() {
    if (this.shouldExit()) return;
  }

  async end() {
    if (this.shouldExit() || !this._isGenerationSuccessful()) {
      await super.end();
      return;
    }

    for (const f of this.modelFiles) {
      await this._updateIndexFile(this.artifactInfo.outDir, f);
    }

    await super.end();
  }
};
