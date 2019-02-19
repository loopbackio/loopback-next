// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const _ = require('lodash');
const ArtifactGenerator = require('../../lib/artifact-generator');
const debug = require('../../lib/debug')('relation-generator');
const inspect = require('util').inspect;
const path = require('path');
const chalk = require('chalk');
const utils = require('../../lib/utils');
const tsquery = require('../../lib/ast-helper');
const ast = require('ts-simple-ast');
const relationUtils = require('./relationutils');

const RelationBelongsTo = require('./relationBelongsTo');
const RelationHasMany = require('./relationHasMany');
const RelationHasOne = require('./relationHasOne');

const RepositoryRelation = require('./repositoryRelation');

const ERROR_INCORRECT_RELATION_TYPE = 'Incorrect Relation Type';
const ERROR_MODEL_DOES_NOT_EXIST = 'model does not exist.';
const ERROR_NO_DESTINATION_MODEL_SELECTED = 'No destination model selected';
const ERROR_NO_MODELS_FOUND = 'No models found in';
const ERROR_NO_SOURCE_MODEL_SELECTED = 'No source model selected';
const ERROR_RELATION_TYPE_PARAMETER_SHOULD_BE_SPECIFIED = 
  "'relationType' parameter should be specified.";
const ERROR_SOURCE_MODEL_PRIMARY_KEY_DOES_NOT_EXIST =
  'Source model primary key does not exist.';

const PROMPT_BASE_RELATION_CLASS = 'Please select the relation type';
const PROMPT_MESSAGE_SOURCE_MODEL = 'Please select source model';
const PROMPT_MESSAGE_TARGET_MODEL = 'Please select target model';
const PROMPT_MESSAGE_PROPERTY_NAME = 'Property name for the relation';
const PROMPT_MESSAGE_FOREIGN_KEY_NAME = 'Foreign key name for the relation';

const relPathControllersFolder = '/controllers';
const relPathModelsFolder = '/models';
const relPathRepositoriesFolder = '/repositories';

module.exports = class RelationGenerator extends ArtifactGenerator {
  constructor(args, opts) {
    super(args, opts);
    this.args = args;
    this.opts = opts;

    this.option('relationType', {
      type: String,
      required: false,
      description: 'Relation type',
    });

    this.option('sourceModel', {
      type: String,
      required: false,
      description: 'Source model',
    });

    this.option('destinationModel', {
      type: String,
      required: false,
      description: 'Destination model',
    });

    this.option('foreignKeyName', {
      type: String,
      required: false,
      description: 'Destination model foreign key name',
    });

    this.option('relationName', {
      type: String,
      required: false,
      description: 'Relation name',
    });
  }

  /**
   * get the property name for the id field
   * @param {string} modelName
   */
  async _getModelPrimaryKeyProperty(modelName) {
    const modelFile = path.join(
      this.artifactInfo.modelDir,
      utils.getModelFileName(modelName),
    );
    const fileContent = this.fs.read(modelFile, {});

    return tsquery.getIdFromModel(fileContent);
  }

  _getKeyType(sourceFile, propertyName) {
    const classObj = this._getClassObj(sourceFile);
    if (
      classObj
        .getProperties()
        .map(x => x.getName())
        .includes(propertyName)
    ) {
      return classObj
        .getProperty(propertyName)
        .getType()
        .getText();
    }
  }

  _getClassObj(fileName) {
    const className = fileName.getClasses()[0].getNameOrThrow();
    return fileName.getClassOrThrow(className);
  }

  async _calcSourceModelPrimaryKey() {
    this.artifactInfo.sourceModelPrimaryKey = await this._getModelPrimaryKeyProperty(
      this.artifactInfo.sourceModel,
    );

    if (this.artifactInfo.sourceModelPrimaryKey === null) {
      throw new Error(ERROR_SOURCE_MODEL_PRIMARY_KEY_DOES_NOT_EXIST);
    }
  }

  /**
   * Read source model file and get type of the primary key.
   *
   * @return string
   */
  _calcSourceModelPrimaryKeyType() {
    let project = new ast.Project();

    const sourceFile = path.join(
      this.artifactInfo.modelDir,
      utils.getModelFileName(this.artifactInfo.sourceModel),
    );
    const sf = project.addExistingSourceFile(sourceFile);
    this.artifactInfo.sourceModelPrimaryKeyType = this._getKeyType(
      sf,
      this.artifactInfo.sourceModelPrimaryKey,
    );
  }

  /**
   * Generate default foreign key name. Foreign key name use in target model.
   */
  _calcDefaultForeignKey() {
    this.artifactInfo.defaultForeignKeyName =
      utils.camelCase(this.artifactInfo.sourceModel) +
      utils.toClassName(this.artifactInfo.sourceModelPrimaryKey);
  }

  setOptions() {
    return super.setOptions();
  }

  _setupGenerator() {
    this.artifactInfo = {
      type: 'relation',
      rootDir: utils.sourceRootDir,
      outDir: utils.sourceRootDir,
    };
    this.artifactInfo.modelDir = path.resolve(
      this.artifactInfo.rootDir,
      utils.modelsDir,
    );
  }

  _getDefaultRelationName() {
    var defaultRelationName;
    switch (this.artifactInfo.relationType) {
      case relationUtils.relationType.belongsTo:
        defaultRelationName =
          utils.camelCase(this.artifactInfo.destinationModel) +
          utils.toClassName(this.artifactInfo.sourceModelPrimaryKey);
        break;
      case relationUtils.relationType.hasMany:
        defaultRelationName = utils.pluralize(
          utils.camelCase(this.artifactInfo.destinationModel),
        );
        break;
      case relationUtils.relationType.hasOne:
        defaultRelationName = utils.camelCase(this.artifactInfo.destinationModel);
        break;
      default:
        throw new Error(ERROR_INCORRECT_RELATION_TYPE);
    }

    return defaultRelationName;
  }

  async _promptModelList(message, parameter) {
    let modelList;
    try {
      debug(`model list dir ${this.artifactInfo.modelDir}`);
      modelList = await utils.getArtifactList(
        this.artifactInfo.modelDir,
        'model',
      );
    } catch (err) {
      return this.exit(err);
    }

    if (modelList.length === 0) {
        throw new Error(
          `${ERROR_NO_MODELS_FOUND} ${this.artifactInfo.modelDir}.
        ${chalk.yellow(
          'Please visit https://loopback.io/doc/en/lb4/Model-generator.html for information on how models are discovered',
        )}`,
      );
    }

    if (this.options[parameter]) {
      if (!modelList.includes(this.options[parameter])) {
        throw new Error(`"${this.options[parameter]}" ${ERROR_MODEL_DOES_NOT_EXIST}`);
      }

      debug(
        `${parameter} received from command line: ${this.options[parameter]}`,
      );
      this.artifactInfo[parameter] = this.options[parameter];
    }

    // Prompt a user for model.
    return this.prompt([
      {
        type: 'list',
        name: parameter,
        message: message,
        choices: modelList,
        when: this.artifactInfo[parameter] === undefined,
        default: modelList[0],
      },
    ])
      .then(props => {
        debug(`props after ${parameter} prompt: ${inspect(props)}`);
        Object.assign(this.artifactInfo, props);
        return props;
      })
      .catch(err => {
        debug(`Error during ${parameter} prompt: ${err.stack}`);
        return this.exit(err);
      });
  }

  // Prompt a user for Relation type
  async promptRelationType() {
    if (this.shouldExit()) return false;

    if (this.options.relationType) {
      debug(
        `Relation type received from command line: ${
          this.options.relationType
        }`,
      );
      this.artifactInfo.relationType = this.options.relationType;
    }

    const relationTypeChoices = Object.keys(relationUtils.relationType);
    return this.prompt([
      {
        type: 'list',
        name: 'relationType',
        message: PROMPT_BASE_RELATION_CLASS,
        choices: relationTypeChoices,
        when: this.artifactInfo.relationType === undefined,
        validate: utils.validateClassName,
        default: relationTypeChoices[0],
      },
    ])
      .then(props => {
        debug(`props after relation type prompt: ${inspect(props)}`);
        Object.assign(this.artifactInfo, props);
        return props;
      })
      .catch(err => {
        debug(`Error during relation type prompt: ${err.stack}`);
        return this.exit(err);
      });
  }

  // Get model list for source model.
  async promptSourceModels() {
    if (this.shouldExit()) return false;

    return await this._promptModelList(
      PROMPT_MESSAGE_SOURCE_MODEL,
      'sourceModel',
    );
  }

  // Get model list for target model.
  async promptTargetModels() {
    if (this.shouldExit()) return false;

    return await this._promptModelList(
      PROMPT_MESSAGE_TARGET_MODEL,
      'destinationModel',
    );
  }

  /**
   * Prompt foreign key if not exist:
   *  1. From source model get primary key. If primary key does not exist -
   *  error.
   *  2. Get primary key type from source model.
   *  3. Generate foreign key (camelCase source class Name + primary key name).
   *  4. Check is foreign key exist in destination model. If not - prompt.
   *  Error - if type is not the same.
   */
  async promptForeignKey() {
    if (this.shouldExit()) return false;

    if (_.isEmpty(this.artifactInfo.sourceModel)) {
      return this.exit(new Error(`${ERROR_NO_SOURCE_MODEL_SELECTED}`));
    }

    if (_.isEmpty(this.artifactInfo.destinationModel)) {
      return this.exit(new Error(`${ERROR_NO_DESTINATION_MODEL_SELECTED}`));
    }

    await this._calcSourceModelPrimaryKey();
    this._calcSourceModelPrimaryKeyType();
    this._calcDefaultForeignKey();

    if (
      this.artifactInfo.relationType === relationUtils.relationType.belongsTo
    ) {
      return;
    }
    let project = new ast.Project();

    const destinationFile = path.join(
      this.artifactInfo.modelDir,
      utils.getModelFileName(this.artifactInfo.destinationModel),
    );
    const df = project.addExistingSourceFile(destinationFile);
    const cl = this._getClassObj(df);
    this.artifactInfo.destinationModelForeignKeyExist = cl
      .getProperties()
      .map(x => x.getName())
      .includes(this.artifactInfo.defaultForeignKeyName);

    if (!this.artifactInfo.destinationModelForeignKeyExist) {
      if (this.options.foreignKeyName) {
        debug(
          `Foreign key name received from command line: ${
            this.options.foreignKeyName
          }`,
        );
        this.artifactInfo.foreignKeyName = this.options.foreignKeyName;
      }

      return this.prompt([
        {
          type: 'string',
          name: 'foreignKeyName',
          message: PROMPT_MESSAGE_FOREIGN_KEY_NAME,
          default: this.artifactInfo.defaultForeignKeyName,
          when: this.artifactInfo.foreignKeyName === undefined,
        },
      ])
        .then(props => {
          debug(`props after foreign key name prompt: ${inspect(props)}`);
          Object.assign(this.artifactInfo, props);
          return props;
        })
        .catch(err => {
          debug(`Error during foreign key name prompt: ${err.stack}`);
          return this.exit(err);
        });
    } else {
      this.artifactInfo.foreignKeyName = this.artifactInfo.defaultForeignKeyName;
    }
  }

  async promptRelationName() {
    if (this.shouldExit()) return false;

    if (this.options.relationName) {
      debug(
        `Relation name received from command line: ${
          this.options.relationName
        }`,
      );
      this.artifactInfo.relationName = this.options.relationName;
    }

    return this.prompt([
      {
        type: 'string',
        name: 'relationName',
        message: PROMPT_MESSAGE_PROPERTY_NAME,
        when: this.artifactInfo.relationName === undefined,
        default: this._getDefaultRelationName(),
      },
    ])
      .then(props => {
        debug(`props after relation name prompt: ${inspect(props)}`);
        Object.assign(this.artifactInfo, props);
        return props;
      })
      .catch(err => {
        debug(`Error during relation name prompt: ${err.stack}`);
        return this.exit(err);
      });
  }

  scaffold() {
    if (!this.artifactInfo.relationType) {
      throw new Error(ERROR_RELATION_TYPE_PARAMETER_SHOULD_BE_SPECIFIED);
    }
    debug('Invoke generator...');

    var relation;

    this.artifactInfo.name = this.artifactInfo.relationType;

    switch (this.artifactInfo.relationType) {
      case relationUtils.relationType.belongsTo:
        relation = new RelationBelongsTo(this.args, this.opts);
        break;
      case relationUtils.relationType.hasMany:
        relation = new RelationHasMany(this.args, this.opts);
        break;
      case relationUtils.relationType.hasOne:
        relation = new RelationHasOne(this.args, this.opts);
        break;
      default:
        throw new Error(ERROR_INCORRECT_RELATION_TYPE);
    }

    relation.generateAll(this.artifactInfo);
  }

  async end() {
    await super.end();
  }
};
