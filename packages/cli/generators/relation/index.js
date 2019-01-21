'use strict';

const ArtifactGenerator = require('../../lib/artifact-generator');
const utils = require('../../lib/utils');
const path = require('path');

const PROMPT_BASE_RELATION_CLASS = 'Please select the relation type';
const PROMPT_MESSAGE__SOURCE_MODEL = 'Please select source model';
const PROMPT_MESSAGE__TARGET__MODEL = 'Please select target model';
const availableRelationsBaseClasses = ['belongsTo', 'hasMany', 'hasOne'];
module.exports = class RelationGenerator extends ArtifactGenerator {
  constructor(args, opts) {
    super(args, opts);
  }
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
    if (this.shouldExit()) return false;

    if (this.options.name) {
      this.artifactInfo.className = utils.toClassName(this.options.name);
      this.artifactInfo.outFile = utils.getRepositoryFileName(
        this.options.name,
      );

      // make sure the name supplied from cmd line is only used once
      delete this.options.name;
    } else {
      this.artifactInfo.className = utils.toClassName(
        this.artifactInfo.modelName,
      );

      this.artifactInfo.outFile = utils.getRepositoryFileName(
        this.artifactInfo.modelName,
      );

      this.artifactInfo.indexesToBeUpdated.push({
        dir: this.artifactInfo.outDir,
        file: this.artifactInfo.outFile,
      });
    }

    const source = this.templatePath(
      path.join(
        utils.sourceRootDir,
        utils.repositoriesDir,
        this.artifactInfo.defaultTemplate,
      ),
    );

    const dest = this.destinationPath(
      path.join(this.artifactInfo.outDir, this.artifactInfo.outFile),
    );

    if (debug.enabled) {
      //debug(`artifactInfo: ${inspect(this.artifactInfo)}`);
      //debug(`Copying artifact to: ${dest}`);
    }
    this.copyTemplatedFiles(source, dest, this.artifactInfo);
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
    return this.artifactInfo.relationType;
  }

  //Get model list for source model
  async promptSourceModels() {
    if (this.shouldExit()) return false;

    let modelList;
    try {
      //debug(`model list dir ${this.artifactInfo.modelDir}`);
      modelList = await utils.getArtifactList(
        this.artifactInfo.modelDir,
        'model',
      );
    } catch (err) {
      return this.exit(err);
    }

    if (this.options.model) {
      // debug(`Model name received from command line: ${this.options.model}`);

      this.options.model = utils.toClassName(this.options.model);
      // assign the model name from the command line only if it is valid
      if (
        modelList &&
        modelList.length > 0 &&
        modelList.includes(this.options.model)
      ) {
        Object.assign(this.artifactInfo, {modelNameList: [this.options.model]});
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

    // Prompt a user for source model
    return (this.artifactInfo.sourceModel = await this.prompt([
      {
        type: 'list',
        name: 'modelNameList',
        message: PROMPT_MESSAGE__SOURCE_MODEL,
        choices: modelList,
        when: this.artifactInfo.modelNameList === undefined,
      },
    ]));
  }

  //Get model list for target model
  async promptTargetModels() {
    if (this.shouldExit()) return false;

    let modelList;
    try {
      //debug(`model list dir ${this.artifactInfo.modelDir}`);
      modelList = await utils.getArtifactList(
        this.artifactInfo.modelDir,
        'model',
      );
    } catch (err) {
      return this.exit(err);
    }

    if (this.options.model) {
      // debug(`Model name received from command line: ${this.options.model}`);

      this.options.model = utils.toClassName(this.options.model);
      // assign the model name from the command line only if it is valid
      if (
        modelList &&
        modelList.length > 0 &&
        modelList.includes(this.options.model)
      ) {
        Object.assign(this.artifactInfo, {modelNameList: [this.options.model]});
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

    // Prompt a user for a target model
    return (this.artifactInfo.targetModel = await this.prompt([
      {
        type: 'list',
        name: 'modelNameList',
        message: PROMPT_MESSAGE__TARGET__MODEL,
        choices: modelList,
        when: this.artifactInfo.modelNameList === undefined,
      },
    ]));
  }
  async promptModelId() {
    if (this.shouldExit()) return false;
    let idProperty;
    // Prompt a user for a ID property
    this.artifactInfo.id = await this.prompt([
      {
        type: 'input',
        name: 'propertyName',
        message: `Please enter the name of the ID property for ${
          this.artifactInfo.sourceModel.modelNameList
        }:`,
        default: 'id',
      },
    ]);

    // user supplied the id from the command line
    if (this.options.id) {
      idProperty = this.options.id;
      /**  make sure it is only used once, in case user selected more
       * than one model.
       */
      delete this.options.id;
    } else {
      idProperty = await this._getModelIdProperty(
        this.artifactInfo.sourceModel,
      );
      if (idProperty === null) {
        const answer = await this.prompt(prompts);
        idProperty = answer.propertyName;
      }
    }
    this.artifactInfo.idProperty = idProperty;
    // Generate this repository
    await this._scaffold();
  }
};
