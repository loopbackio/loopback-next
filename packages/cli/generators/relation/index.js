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
const ERROR_NO_DESTINATION_MODEL_SELECTED = 'No destination model selected';
const ERROR_NO_MODELS_FOUND = 'Model was not found in';
const ERROR_NO_SOURCE_MODEL_SELECTED = 'No source model selected';

const PROMPT_BASE_RELATION_CLASS = 'Please select the relation type';
const PROMPT_MESSAGE_SOURCE_MODEL = 'Please select source model';
const PROMPT_MESSAGE_TARGET_MODEL = 'Please select target model';
const PROMPT_MESSAGE_PROPERTY_NAME = 'Property name for the relation';
const PROMPT_MESSAGE_FOREIGN_KEY_NAME = 'Foreign key name for the relation';

const relPathControllersFolder = '/controllers';
const relPathModelsFolder = '/models';
const relPathRepositoriesFolder = '/repositories';

let args;
let opts;

module.exports = class RelationGenerator extends ArtifactGenerator {
  constructor(args, opts) {
    super(args, opts);
    this.args = args;
    this.opts = opts;
  }

  /**
   * get the property name for the id field
   * @param {string} modelName
   */
  async _getModelPrimaryKeyProperty(modelName) {
    let fileContent = '';
    let modelFile = path.join(
      this.artifactInfo.modelDir,
      utils.getModelFileName(modelName),
    );
    try {
      fileContent = this.fs.read(modelFile, {});
    } catch (err) {
      //debug(`${ERROR_READING_FILE} ${modelFile}: ${err.message}`);
      return this.exit(err);
    }

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
    this.options.sourceModelPrimaryKey = await this._getModelPrimaryKeyProperty(
      this.options.sourceModel,
    );

    if (this.options.sourceModelPrimaryKey === null) {
      throw new Error('Source model primary key does not exist.');
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
      utils.getModelFileName(this.options.sourceModel),
    );
    const sf = project.addExistingSourceFile(sourceFile);
    this.options.sourceModelPrimaryKeyType = this._getKeyType(
      sf,
      this.options.sourceModelPrimaryKey,
    );
  }

  /**
   * Generate default foreign key name. Foreign key name use in target model.
   */
  _calcDefaultForeignKey() {
    this.options.defaultForeignKeyName =
      utils.camelCase(this.options.sourceModel) +
      utils.toClassName(this.options.sourceModelPrimaryKey);
  }

  async _scaffold() {
    let relPathCtrl = this.artifactInfo.relPath + relPathControllersFolder;
    let relPathModel = this.artifactInfo.relPath + relPathModelsFolder;
    let relPathRepo = this.artifactInfo.relPath + relPathRepositoriesFolder;

    if (!this.options.relationType) {
      throw new Error("'relationType' parameters should be specified.");
    }
    if (this.options.sourceModel === this.options.destinationModel) {
      throw new Error(
        "'sourceModel' and 'destinationModel' parameter values should be different.",
      );
    }
    debug('Invoke Controller generator...');

    var relation;

    this.artifactInfo.name = this.options.relationType;
    this.artifactInfo.relPath = relPathCtrl;

    switch (this.options.relationType) {
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

    relation.generateControllers(this.options);

    debug('Invoke Model generator...');
    this.artifactInfo.relPath = relPathModel;
    relation.generateModels(this.options);
    /*
                debug('Invoke Repository generator...');
                let repo = new RepositoryRelation(this.args, this.opts);
                this.artifactInfo.relPath = relPathRepo;
                repo.generateRelationRepository(
                  this.options.sourceModel,
                  this.options.destinationModel,
                  this.options.foreignKey,
                  this.options.relationType,
                );
            */
    return;
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
    switch (this.options.relationType) {
      case relationUtils.relationType.belongsTo:
        defaultRelationName =
          utils.camelCase(this.options.destinationModel) +
          utils.toClassName(this.options.sourceModelPrimaryKey);
        break;
      case relationUtils.relationType.hasMany:
        defaultRelationName = utils.pluralize(
          utils.camelCase(this.options.destinationModel),
        );
        break;
      case relationUtils.relationType.hasOne:
        defaultRelationName = utils.camelCase(this.options.destinationModel);
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

    if (this.options[parameter]) {
      debug(
        `Model name received from command line: ${this.options[parameter]}`,
      );

      this.options.model = utils.toClassName(this.options[parameter]);
      // assign the model name from the command line only if it is valid
      if (
        modelList &&
        modelList.length > 0 &&
        modelList.includes(this.options.model)
      ) {
        Object.assign(this.artifactInfo, {
          modelNameList: [this.options[parameter]],
        });
      } else {
        modelList = [];
      }
    }
    if (modelList.length === 0) {
      return this.exit(
        new Error(
          `${ERROR_NO_MODELS_FOUND} ${this.artifactInfo.modelDir}.
        ${chalk.yellow(
            'Please visit https://loopback.io/doc/en/lb4/Model-generator.html for information on how models are discovered',
          )}`,
        ),
      );
    }

    // Prompt a user for model.
    this.artifactInfo[parameter] = await this.prompt([
      {
        type: 'list',
        name: parameter,
        message: message,
        choices: modelList,
        when: this.artifactInfo.modelNameList === undefined,
      },
    ]);

    this.options[parameter] = this.artifactInfo[parameter][parameter];

    return this.artifactInfo[parameter];
  }

  // Prompt a user for Relation type
  async promptRelationBaseClassName() {
    this.artifactInfo.relationType = await this.prompt([
      {
        type: 'list',
        name: 'relationType',
        message: PROMPT_BASE_RELATION_CLASS,
        choices: Object.keys(relationUtils.relationType),
        when: !this.artifactInfo.relationType,
        validate: utils.validateClassName,
      },
    ]);
    this.options.relationType = this.artifactInfo.relationType.relationType;
    return this.artifactInfo.relationType;
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

    if (_.isEmpty(this.options.sourceModel)) {
      return this.exit(new Error(`${ERROR_NO_SOURCE_MODEL_SELECTED}`));
    }

    if (_.isEmpty(this.options.destinationModel)) {
      return this.exit(new Error(`${ERROR_NO_DESTINATION_MODEL_SELECTED}`));
    }

    await this._calcSourceModelPrimaryKey();
    this._calcSourceModelPrimaryKeyType();
    this._calcDefaultForeignKey();

    if (this.options.relationType === relationUtils.relationType.belongsTo) {
      return;
    }
    let project = new ast.Project();

    const destinationFile = path.join(
      this.artifactInfo.modelDir,
      utils.getModelFileName(this.options.destinationModel),
    );
    const df = project.addExistingSourceFile(destinationFile);
    const cl = this._getClassObj(df);
    this.options.destinationModelForeignKeyExist = cl
      .getProperties()
      .map(x => x.getName())
      .includes(this.options.defaultForeignKeyName);

    if (!this.options.destinationModelForeignKeyExist) {
      this.artifactInfo.destinationModelForeignKeyName = await this.prompt([
        {
          type: 'string',
          name: 'value',
          message: PROMPT_MESSAGE_FOREIGN_KEY_NAME,
          default: this.options.defaultForeignKeyName,
          when: !this.artifactInfo.destinationModelForeignKeyName,
        },
      ]);
      this.options.destinationModelForeignKeyName = this.artifactInfo.destinationModelForeignKeyName.value;
    } else {
      this.options.destinationModelForeignKeyName = this.options.defaultForeignKeyName;
    }
  }

  async promptRelationName() {
    if (this.shouldExit()) return false;

    const defaultRelationName = this._getDefaultRelationName();

    this.artifactInfo.relationName = await this.prompt([
      {
        type: 'string',
        name: 'value',
        message: PROMPT_MESSAGE_PROPERTY_NAME,
        default: defaultRelationName,
        when: !this.artifactInfo.relationName,
      },
    ]);
    this.options.relationName = this.artifactInfo.relationName.value;

    //Generate this repository
    await this._scaffold();
  }
};
