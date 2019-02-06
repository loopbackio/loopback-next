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

const ControllerRelation = require('./controllerRelation');
const RepositoryRelation = require('./repositoryRelation');
const ModelRelation = require('./modelRelation');

const PROMPT_BASE_RELATION_CLASS = 'Please select the relation type';
const PROMPT_MESSAGE__SOURCE_MODEL = 'Please select source model';
const PROMPT_MESSAGE__TARGET__MODEL = 'Please select target model';

const RELATION_TYPE_BELONGS_TO = 'belongsTo';
const RELATION_TYPE_HAS_MANY = 'hasMany';
const RELATION_TYPE_HAS_ONE = 'hasOne';

const availableRelationsBaseClasses = [
  RELATION_TYPE_BELONGS_TO,
  RELATION_TYPE_HAS_MANY,
  RELATION_TYPE_HAS_ONE
];

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
  async _getModelIdProperty(modelName) {
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

    this.options.relationName = 'bzzzzzzzzzzzzzzz';

    let ctrl = new ControllerRelation(this.args, this.opts);
    this.artifactInfo.name = this.options.relationType;
    this.artifactInfo.relPath = relPathCtrl;

    switch (this.options.relationType) {
      case RELATION_TYPE_BELONGS_TO:
        ctrl.generateControllerRelationBelongsTo(
          this.options.sourceModel,
          this.options.destinationModel,
          this.options.foreignKey,
          this.options.relationName,
        );
        break;
      case RELATION_TYPE_HAS_MANY:
        ctrl.generateControllerRelationHasMany(
          this.options.sourceModel,
          this.options.destinationModel,
          this.options.foreignKey,
          this.options.relationName,
        );
        break;
      case RELATION_TYPE_HAS_ONE:
        ctrl.generateControllerRelationHasOne(
          this.options.sourceModel,
          this.options.destinationModel,
          this.options.foreignKey,
          this.options.relationName,
        );
        break;
      default:
        throw new Error('Incorrect Relation Type');
    }

    //Invoke here Model and Repository Generators
    debug('Invoke Model generator...');
    let model = new ModelRelation(this.args, this.opts);
    this.artifactInfo.name = this.options.relationType;
    this.artifactInfo.relPath = relPathModel;
    model.generateRelationModel(
      this.options.sourceModel,
      this.options.destinationModel,
      this.options.foreignKey,
      this.options.relationType,
    );
    /*
        debug('Invoke Repository generator...');
        let repo = new RepositoryRelation(this.args, this.opts);
        this.artifactInfo.name = this.options.relationType;
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

  // Prompt a user for Relation type
  async promptRelationBaseClassName() {
    this.artifactInfo.relationType = await this.prompt([
      {
        type: 'list',
        name: 'relationBaseClass',
        message: PROMPT_BASE_RELATION_CLASS,
        choices: availableRelationsBaseClasses,
        when: !this.artifactInfo.availableRelationsBaseClasses,
        validate: utils.validateClassName,
      },
    ]);
    this.options.relationType = this.artifactInfo.relationType.relationBaseClass;
    return this.artifactInfo.relationType;
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
      debug(`Model name received from command line: ${this.options[parameter]}`);

      this.options.model = utils.toClassName(this.options[parameter]);
      // assign the model name from the command line only if it is valid
      if (
        modelList &&
        modelList.length > 0 &&
        modelList.includes(this.options.model)
      ) {
        Object.assign(this.artifactInfo, { modelNameList: [this.options[parameter]] });
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
        name: 'modelNameList',
        message: message,
        choices: modelList,
        when: this.artifactInfo.modelNameList === undefined,
      },
    ]);
    this.options[parameter] = this.artifactInfo[parameter].modelNameList;
    return this.artifactInfo[parameter];
  }

  // Get model list for source model.
  async promptSourceModels() {
    if (this.shouldExit()) return false;

    return await this._promptModelList(
      PROMPT_MESSAGE__SOURCE_MODEL,
      'sourceModel'
    );
  }

  // Get model list for target model.
  async promptTargetModels() {
    if (this.shouldExit()) return false;

    return await this._promptModelList(
      PROMPT_MESSAGE__TARGET__MODEL,
      'destinationModel'
    );
  }

  //Prompt ID
  async promptModelId() {
    if (this.shouldExit()) return false;
    let idProperty;

    debug(`Model ID property name from command line: ${this.options.id}`);
    debug(`Selected Models: ${this.artifactInfo.sourceModel}`);

    if (_.isEmpty(this.artifactInfo.sourceModel)) {
      return this.exit(new Error(`${ERROR_NO_MODEL_SELECTED}`));
    } else {
      const prompts = [
        {
          type: 'input',
          name: 'propertyName',
          message: `Please enter the name of the ID property for ${
            this.artifactInfo.sourceModel
            }:`,
          default: 'id',
        },
      ];

      // user supplied the id from the command line
      if (this.options.id) {
        debug(`passing thru this.options.id with value : ${this.options.id}`);

        idProperty = this.options.id;
        /**  make sure it is only used once, in case user selected more
         * than one model.
         */
        delete this.options.id;
      } else {
        idProperty = await this._getModelIdProperty(
          this.artifactInfo.sourceModel.modelNameList,
        );

        if (idProperty === null) {
          const answer = await this.prompt(prompts);
          idProperty = answer.propertyName;
        }
      }
      this.options.foreignKey = idProperty;
      //Generate this repository
      await this._scaffold();
      //}
    }
  }
};
