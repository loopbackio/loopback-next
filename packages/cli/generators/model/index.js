// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const ArtifactGenerator = require('../../lib/artifact-generator');
const debug = require('../../lib/debug')('model-generator');
const utils = require('../../lib/utils');
const chalk = require('chalk');
const path = require('path');

/**
 * Model Generator
 *
 * Prompts for a Model name, Model Base Class (currently defaults to 'Entity').
 * Creates the Model Class -- currently a one time process only.
 *
 * Will prompt for properties to add to the Model till a blank property name is
 * entered. Will also ask if a property is required, the default value for the
 * property, if it's the ID (unless one has been selected), etc.
 */
module.exports = class ModelGenerator extends ArtifactGenerator {
  constructor(args, opts) {
    super(args, opts);
  }

  _setupGenerator() {
    this.artifactInfo = {
      type: 'model',
      rootDir: 'src',
    };

    this.artifactInfo.outDir = path.resolve(
      this.artifactInfo.rootDir,
      'models',
    );

    // Model Property Types
    this.typeChoices = [
      'string',
      'number',
      'boolean',
      'object',
      'array',
      'date',
      'buffer',
      'geopoint',
      'any',
    ];

    this.artifactInfo.properties = {};
    this.propCounter = 0;

    return super._setupGenerator();
  }

  setOptions() {
    return super.setOptions();
  }

  checkLoopBackProject() {
    return super.checkLoopBackProject();
  }

  async promptArtifactName() {
    await super.promptArtifactName();
    this.artifactInfo.className = utils.toClassName(this.artifactInfo.name);
    this.log(
      `Let's add a property to ${chalk.yellow(this.artifactInfo.className)}`,
    );
  }

  // Prompt for a property name
  async promptPropertyName() {
    this.log(`Enter an empty property name when done`);

    delete this.propName;

    const prompts = [
      {
        name: 'propName',
        message: 'Enter the property name:',
        validate: function(val) {
          if (val) {
            return utils.checkPropertyName(val);
          } else {
            return true;
          }
        },
      },
    ];

    const answers = await this.prompt(prompts);
    debug(`propName => ${JSON.stringify(answers)}`);
    if (answers.propName) {
      this.artifactInfo.properties[answers.propName] = {};
      this.propName = answers.propName;
    }
    return this._promptPropertyInfo();
  }

  // Internal Method. Called when a new property is entered.
  // Prompts the user for more information about the property to be added.
  async _promptPropertyInfo() {
    if (!this.propName) {
      return true;
    } else {
      const prompts = [
        {
          name: 'type',
          message: 'Property type:',
          type: 'list',
          choices: this.typeChoices,
        },
        {
          name: 'arrayType',
          message: 'Type of array items:',
          type: 'list',
          choices: this.typeChoices.filter(choice => {
            return choice !== 'array';
          }),
          when: answers => {
            return answers.type === 'array';
          },
        },
        {
          name: 'id',
          message: 'Is ID field?',
          type: 'confirm',
          default: false,
          when: answers => {
            return (
              !this.idFieldSet &&
              !['array', 'object', 'buffer'].includes(answers.type)
            );
          },
        },
        {
          name: 'required',
          message: 'Required?:',
          type: 'confirm',
          default: false,
        },
        {
          name: 'default',
          message: `Default value ${chalk.yellow('[leave blank for none]')}:`,
          when: answers => {
            return ![null, 'buffer', 'any'].includes(answers.type);
          },
        },
      ];

      const answers = await this.prompt(prompts);
      debug(`propertyInfo => ${JSON.stringify(answers)}`);
      if (answers.default === '') {
        delete answers.default;
      }

      Object.assign(this.artifactInfo.properties[this.propName], answers);
      if (answers.id) {
        this.idFieldSet = true;
      }

      this.log(
        `Let's add another property to ${chalk.yellow(
          this.artifactInfo.className,
        )}`,
      );
      return this.promptPropertyName();
    }
  }

  scaffold() {
    if (this.shouldExit()) return false;

    debug('scaffolding');

    // Data for templates
    this.artifactInfo.fileName = utils.kebabCase(this.artifactInfo.name);
    this.artifactInfo.outFile = `${this.artifactInfo.fileName}.model.ts`;

    // Resolved Output Path
    const tsPath = this.destinationPath(
      this.artifactInfo.outDir,
      this.artifactInfo.outFile,
    );

    const modelTemplatePath = this.templatePath('model.ts.ejs');

    // Set up types for Templating
    const TS_TYPES = ['string', 'number', 'object', 'boolean', 'any'];
    const NON_TS_TYPES = ['geopoint', 'date'];
    Object.entries(this.artifactInfo.properties).forEach(([key, val]) => {
      // Default tsType is the type property
      val.tsType = val.type;

      // Override tsType based on certain type values
      if (val.type === 'array') {
        if (TS_TYPES.includes(val.arrayType)) {
          val.tsType = `${val.arrayType}[]`;
        } else if (val.type === 'buffer') {
          val.tsType = `Buffer[]`;
        } else {
          val.tsType = `string[]`;
        }
      } else if (val.type === 'buffer') {
        val.tsType = 'Buffer';
      }

      if (NON_TS_TYPES.includes(val.tsType)) {
        val.tsType = 'string';
      }

      if (
        val.defaultValue &&
        NON_TS_TYPES.concat(['string', 'any']).includes(val.type)
      ) {
        val.defaultValue = `'${val.defaultValue}'`;
      }

      // Convert Type to include '' for template
      val.type = `'${val.type}'`;

      if (!val.required) {
        delete val.required;
      }

      if (!val.id) {
        delete val.id;
      }
    });

    this.fs.copyTpl(modelTemplatePath, tsPath, this.artifactInfo);
  }

  async end() {
    await super.end();
  }
};
