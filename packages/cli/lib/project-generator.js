// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const BaseGenerator = require('./base-generator');
const utils = require('./utils');
const chalk = require('chalk');
const cliVersion = require('../package.json').version;
const path = require('path');

module.exports = class ProjectGenerator extends BaseGenerator {
  // Note: arguments and options should be defined in the constructor.
  constructor(args, opts) {
    super(args, opts);
    // The default list of build options available for a project
    // This list gets shown to users to let them select the appropriate
    // build settings for their project.
    this.buildOptions = [
      {
        name: 'eslint',
        description: 'add a linter with pre-configured lint rules',
      },
      {
        name: 'prettier',
        description: 'install prettier to format code conforming to rules',
      },
      {
        name: 'mocha',
        description: 'install mocha to run tests',
      },
      {
        name: 'loopbackBuild',
        description: 'use @loopback/build helpers (e.g. lb-eslint)',
      },
      {name: 'vscode', description: 'add VSCode config files'},
    ];
  }

  _setupGenerator() {
    this.argument('name', {
      type: String,
      required: false,
      description: 'Project name for the ' + this.projectType,
    });

    this.option('description', {
      type: String,
      description: 'Description for the ' + this.projectType,
    });

    this.option('outdir', {
      type: String,
      description: 'Project root directory for the ' + this.projectType,
    });

    this.option('eslint', {
      type: Boolean,
      description: 'Enable eslint',
    });

    this.option('prettier', {
      type: Boolean,
      description: 'Enable prettier',
    });

    this.option('mocha', {
      type: Boolean,
      description: 'Enable mocha',
    });

    this.option('loopbackBuild', {
      type: Boolean,
      description: 'Use @loopback/build',
    });

    this.option('vscode', {
      type: Boolean,
      description: 'Use preconfigured VSCode settings',
    });

    this.option('private', {
      type: Boolean,
      description: 'Mark the project private (excluded from npm publish)',
    });

    this._setupRenameTransformer();
    super._setupGenerator();
  }

  /**
   * Registers a Transform Stream with Yeoman. Removes `.ejs` extension
   * from files that have it during project generation.
   */
  _setupRenameTransformer() {
    this.registerTransformStream(utils.renameEJS());
  }

  async setOptions() {
    await super.setOptions();
    if (this.shouldExit()) return false;
    if (this.options.name) {
      const msg = utils.validate(this.options.name);
      if (typeof msg === 'string') {
        this.exit(msg);
        return false;
      }
    }

    this.projectInfo = {
      projectType: this.projectType,
      dependencies: utils.getDependencies(),
    };
    this.projectOptions = ['name', 'description', 'outdir', 'private'].concat(
      this.buildOptions,
    );
    this.projectOptions.forEach(n => {
      if (typeof n === 'object') {
        n = n.name;
      }
      if (this.options[n]) {
        this.projectInfo[n] = this.options[n];
      }
    });
  }

  promptProjectName() {
    if (this.shouldExit()) return false;
    const prompts = [
      {
        type: 'input',
        name: 'name',
        message: 'Project name:',
        when: this.projectInfo.name == null,
        default:
          this.options.name || utils.toFileName(path.basename(process.cwd())),
        validate: utils.validate,
      },
      {
        type: 'input',
        name: 'description',
        message: 'Project description:',
        when: this.projectInfo.description == null,
        default: this.options.name || this.appname,
      },
    ];

    return this.prompt(prompts).then(props => {
      Object.assign(this.projectInfo, props);
    });
  }

  promptProjectDir() {
    if (this.shouldExit()) return false;
    const prompts = [
      {
        type: 'input',
        name: 'outdir',
        message: 'Project root directory:',
        when:
          this.projectInfo.outdir == null ||
          // prompts if option was set to a directory that already exists
          utils.validateNotExisting(this.projectInfo.outdir) !== true,
        validate: utils.validateNotExisting,
        default: utils.toFileName(this.projectInfo.name),
      },
    ];

    return this.prompt(prompts).then(props => {
      Object.assign(this.projectInfo, props);
    });
  }

  promptOptions() {
    if (this.shouldExit()) return false;
    const choices = [];
    this.buildOptions.forEach(f => {
      if (this.options[f.name] == null) {
        choices.push({
          name: `Enable ${f.name}: ${chalk.gray(f.description)}`,
          key: f.name,
          short: `Enable ${f.name}`,
          checked: true,
        });
      } else {
        this.projectInfo[f.name] = this.options[f.name];
      }
    });
    const prompts = [
      {
        name: 'settings',
        message: 'Select features to enable in the project',
        type: 'checkbox',
        choices: choices,
        // Skip if all features are enabled by cli options
        when: choices.length > 0,
      },
    ];
    return this.prompt(prompts).then(props => {
      const settings = props.settings || choices.map(c => c.short);
      const features = choices.map(c => {
        return {
          key: c.key,
          value:
            settings.indexOf(c.name) !== -1 || settings.indexOf(c.short) !== -1,
        };
      });
      features.forEach(f => (this.projectInfo[f.key] = f.value));
    });
  }

  scaffold() {
    if (this.shouldExit()) return false;

    this.destinationRoot(this.projectInfo.outdir);

    // Store original cli version in .yo.rc.json
    this.config.set('version', cliVersion);

    // First copy common files from ../../project/templates
    this.copyTemplatedFiles(
      this.templatePath('../../project/templates/**/*'),
      this.destinationPath(''),
      {
        project: this.projectInfo,
      },
    );

    // Rename `_.gitignore` back to `.gitignore`.
    // Please note `.gitignore` will be renamed to `.npmignore` during publish
    // if it's there in the templates.
    this.fs.move(
      this.destinationPath('_.gitignore'),
      this.destinationPath('.gitignore'),
    );

    // Copy project type specific files from ./templates
    this.copyTemplatedFiles(
      this.templatePath('**/*'),
      this.destinationPath(''),
      {
        project: this.projectInfo,
      },
    );

    if (!this.projectInfo.eslint) {
      this.fs.delete(this.destinationPath('.eslintrc.*.ejs'));
      this.fs.delete(this.destinationPath('.eslintignore'));
    }

    if (!this.projectInfo.prettier) {
      this.fs.delete(this.destinationPath('.prettier*'));
    }

    if (!this.projectInfo.loopbackBuild) {
      this.fs.move(
        this.destinationPath('package.plain.json.ejs'),
        this.destinationPath('package.json.ejs'),
      );
    } else {
      this.fs.delete(this.destinationPath('package.plain.json.ejs'));
    }

    if (!this.projectInfo.mocha) {
      this.fs.delete(this.destinationPath('.mocharc.json'));
    }

    if (!this.projectInfo.vscode) {
      this.fs.delete(this.destinationPath('.vscode'));
    }
  }
};
