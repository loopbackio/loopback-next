// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const ArtifactGenerator = require('../../lib/artifact-generator');
const debug = require('../../lib/debug')('model-generator');
const inspect = require('util').inspect;
const utils = require('../../lib/utils');
const chalk = require('chalk');
const path = require('path');

const PROMPT_BASE_MODEL_CLASS = 'Please select the model base class';
const ERROR_NO_MODELS_FOUND = 'Model was not found in';
const BASE_MODELS = ['Entity', 'Model'];
const CLI_BASE_MODELS = [
  {
    name: `Entity ${chalk.gray('(A persisted model with an ID)')}`,
    value: 'Entity',
  },
  {name: `Model ${chalk.gray('(A business domain object)')}`, value: 'Model'},
  {type: 'separator', line: '----- Custom Models -----'},
];
const MODEL_TEMPLATE_PATH = 'model.ts.ejs';

/**
 * Model Generator
 *
 * Prompts for a Model name and model properties and creates the model class.
 * Currently properties can only be added once to each model using the CLI (at
 * creation).
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
      rootDir: utils.sourceRootDir,
    };

    this.artifactInfo.outDir = path.resolve(
      this.artifactInfo.rootDir,
      utils.modelsDir,
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

    this.artifactInfo.modelDir = path.resolve(
      this.artifactInfo.rootDir,
      utils.modelsDir,
    );

    this.option('base', {
      type: String,
      required: false,
      description: 'A valid based model',
    });

    return super._setupGenerator();
  }

  setOptions() {
    return super.setOptions();
  }

  checkLoopBackProject() {
    if (this.shouldExit()) return;
    return super.checkLoopBackProject();
  }

  // Prompt a user for Model Name
  async promptArtifactName() {
    if (this.shouldExit()) return;
    await super.promptArtifactName();
    this.artifactInfo.className = utils.toClassName(this.artifactInfo.name);
  }

  // Ask for Model base class
  async promptModelBaseClassName() {
    if (this.shouldExit()) return;
    const availableModelBaseClasses = [];

    availableModelBaseClasses.push(...CLI_BASE_MODELS);

    try {
      debug(`model list dir ${this.artifactInfo.modelDir}`);
      const modelList = await utils.getArtifactList(
        this.artifactInfo.modelDir,
        'model',
      );
      debug(`modelist ${modelList}`);

      if (modelList && modelList.length > 0) {
        availableModelBaseClasses.push(...modelList);
        debug(`availableModelBaseClasses ${availableModelBaseClasses}`);
      }
    } catch (err) {
      debug(`error ${err}`);
      return this.exit(err);
    }

    if (
      this.options.base &&
      availableModelBaseClasses.includes(this.options.base)
    ) {
      this.artifactInfo.modelBaseClass = utils.toClassName(this.options.base);
    } else {
      if (this.options.base) {
        // the model specified in the command line does not exists
        return this.exit(
          new Error(
            `${ERROR_NO_MODELS_FOUND} ${
              this.artifactInfo.modelDir
            }.${chalk.yellow(
              'Please visit https://loopback.io/doc/en/lb4/Model-generator.html for information on how models are discovered',
            )}`,
          ),
        );
      }
    }

    return this.prompt([
      {
        type: 'list',
        name: 'modelBaseClass',
        message: PROMPT_BASE_MODEL_CLASS,
        choices: availableModelBaseClasses,
        when: !this.artifactInfo.modelBaseClass,
        default: availableModelBaseClasses[0],
        validate: utils.validateClassName,
      },
    ])
      .then(props => {
        if (typeof props.modelBaseClass === 'object')
          props.modelBaseClass = props.modelBaseClass.value;

        Object.assign(this.artifactInfo, props);
        debug(`props after model base class prompt: ${inspect(props)}`);
        this.log(
          `Let's add a property to ${chalk.yellow(
            this.artifactInfo.className,
          )}`,
        );
        return props;
      })
      .catch(err => {
        debug(`Error during model base class prompt: ${err}`);
        return this.exit(err);
      });
  }

  // Prompt for a Property Name
  async promptPropertyName() {
    if (this.shouldExit()) return false;

    this.log(`Enter an empty property name when done`);
    this.log();

    // This function can be called repeatedly so this deletes the previous
    // property name if one was set.
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
          name: 'itemType',
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
          message: `Is ${chalk.yellow(this.propName)} the ID property?`,
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
          message: 'Is it required?:',
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

      // Yeoman sets the default to `''` so we remove it unless the user entered
      // a different value
      if (answers.default === '') {
        delete answers.default;
      }

      Object.assign(this.artifactInfo.properties[this.propName], answers);

      // We prompt for `id` only once per model using idFieldSet flag.
      if (answers.id) {
        this.idFieldSet = true;
      }

      this.log();
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
    this.artifactInfo.outFile = utils.getModelFileName(this.artifactInfo.name);

    // Resolved Output Path
    const tsPath = this.destinationPath(
      this.artifactInfo.outDir,
      this.artifactInfo.outFile,
    );

    this.artifactInfo.isModelBaseBuiltin = BASE_MODELS.includes(
      this.artifactInfo.modelBaseClass,
    );

    // Set up types for Templating
    const TS_TYPES = ['string', 'number', 'object', 'boolean', 'any'];
    const NON_TS_TYPES = ['geopoint', 'date'];
    Object.values(this.artifactInfo.properties).forEach(val => {
      // Default tsType is the type property
      val.tsType = val.type;

      // Override tsType based on certain type values
      if (val.type === 'array') {
        if (TS_TYPES.includes(val.itemType)) {
          val.tsType = `${val.itemType}[]`;
        } else if (val.type === 'buffer') {
          val.tsType = 'Buffer[]';
        } else {
          val.tsType = 'string[]';
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
      if (val.itemType) {
        val.itemType = `'${val.itemType}'`;
      }

      // If required is false, we can delete it as that's the default assumption
      // for this field if not present. This helps to avoid polluting the
      // decorator with redundant properties.
      if (!val.required) {
        delete val.required;
      }

      // We only care about marking the `id` field as `id` and not fields that
      // are not the id so if this is false we delete it similar to `required`.
      if (!val.id) {
        delete val.id;
      }
    });

    this.copyTemplatedFiles(
      this.templatePath(MODEL_TEMPLATE_PATH),
      tsPath,
      this.artifactInfo,
    );
  }

  async end() {
    await super.end();
  }
};
