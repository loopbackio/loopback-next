// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const BaseGenerator = require('./base-generator');
const debug = require('./debug')('artifact-generator');
const utils = require('./utils');
const updateIndex = require('./update-index');
const path = require('path');
const chalk = require('chalk');
const StatusConflicter = utils.StatusConflicter;

module.exports = class ArtifactGenerator extends BaseGenerator {
  // Note: arguments and options should be defined in the constructor.
  constructor(args, opts) {
    super(args, opts);
  }

  _setupGenerator() {
    debug('Setting up generator');
    this.argument('name', {
      type: String,
      required: false,
      description: 'Name for the ' + this.artifactInfo.type,
    });
    // argument validation
    if (this.args.length) {
      const validationMsg = utils.validateClassName(this.args[0]);
      if (typeof validationMsg === 'string') throw new Error(validationMsg);
    }
    this.artifactInfo.name = this.args[0];
    this.artifactInfo.defaultName = 'new';
    this.artifactInfo.relPath = path.relative(
      this.destinationPath(),
      this.artifactInfo.outDir,
    );
    this.conflicter = new StatusConflicter(
      this.env.adapter,
      this.options.force,
    );
  }

  /**
   * Checks if current directory is a LoopBack project by checking for
   * keyword 'loopback' under 'keywords' attribute in package.json.
   * 'keywords' is an array
   */
  checkLoopBackProject() {
    debug('Checking for loopback project');
    if (this.shouldExit()) return false;
    const pkg = this.fs.readJSON(this.destinationPath('package.json'));
    const key = 'loopback';
    if (!pkg) {
      const err = new Error(
        'No package.json found in ' +
          this.destinationRoot() +
          '. ' +
          'The command must be run in a LoopBack project.',
      );
      this.exit(err);
      return;
    }
    if (!pkg.keywords || !pkg.keywords.includes(key)) {
      const err = new Error(
        'No `loopback` keyword found in ' +
          this.destinationPath('package.json') +
          '. ' +
          'The command must be run in a LoopBack project.',
      );
      this.exit(err);
    }
  }

  promptArtifactName() {
    debug('Prompting for artifact name');
    if (this.shouldExit()) return false;
    const prompts = [
      {
        type: 'input',
        name: 'name',
        // capitalization
        message: utils.toClassName(this.artifactInfo.type) + ' class name:',
        when: this.artifactInfo.name === undefined,
        validate: utils.validateClassName,
      },
    ];

    return this.prompt(prompts).then(props => {
      Object.assign(this.artifactInfo, props);
      return props;
    });
  }

  scaffold() {
    debug('Scaffolding artifact(s)');
    if (this.shouldExit()) return false;
    // Capitalize class name
    this.artifactInfo.name = utils.toClassName(this.artifactInfo.name);

    // Copy template files from ./templates
    // Renaming of the files should be done in the generator inheriting from this one
    this.fs.copyTpl(
      this.templatePath('**/*'),
      this.destinationPath(),
      this.artifactInfo,
      {},
      {globOptions: {dot: true}},
    );
  }

  async end() {
    const success = super.end();
    if (!success) return false;

    let generationStatus = true;
    // Check all files being generated to ensure they succeeded
    Object.entries(this.conflicter.generationStatus).forEach(([key, val]) => {
      if (val === 'skip' || val === 'identical') generationStatus = false;
    });

    if (generationStatus) {
      /**
       * Update the index.ts in this.artifactInfo.outDir. Creates it if it
       * doesn't exist.
       * this.artifactInfo.outFile is what is exported from the file.
       *
       * Both those properties must be present for this to happen. Optionally,
       * this can be disabled even if the properties are present by setting:
       * this.artifactInfo.disableIndexUdpdate = true;
       */
      if (
        this.artifactInfo.outDir &&
        this.artifactInfo.outFile &&
        !this.artifactInfo.disableIndexUpdate
      ) {
        await updateIndex(this.artifactInfo.outDir, this.artifactInfo.outFile);
        // Output for users
        this.log(
          chalk.green('   update'),
          `${this.artifactInfo.relPath}/index.ts`,
        );
      }

      // User Output
      this.log();
      this.log(
        utils.toClassName(this.artifactInfo.type),
        chalk.yellow(this.artifactInfo.name),
        'is now created in',
        `${this.artifactInfo.relPath}/`,
      );
      this.log();
    }

    return false;
  }
};
