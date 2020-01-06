// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const ArtifactGenerator = require('../../lib/artifact-generator');
const debug = require('../../lib/debug')('relation-generator');
const inspect = require('util').inspect;
const path = require('path');
const chalk = require('chalk');
const utils = require('../../lib/utils');
const relationUtils = require('./utils.generator');

const BelongsToRelationGenerator = require('./belongs-to-relation.generator');
const HasManyRelationGenerator = require('./has-many-relation.generator');

const ERROR_INCORRECT_RELATION_TYPE = 'Incorrect relation type';
const ERROR_MODEL_DOES_NOT_EXIST = 'model does not exist.';
const ERROR_NO_MODELS_FOUND = 'No models found in';
const ERROR_SOURCE_MODEL_PRIMARY_KEY_DOES_NOT_EXIST =
  'Source model primary key does not exist.';
const ERROR_DESTINATION_MODEL_PRIMARY_KEY_DOES_NOT_EXIST =
  'Target model primary key does not exist.';
const ERROR_REPOSITORY_DOES_NOT_EXIST =
  'class does not exist. Please create repository first with "lb4 repository" command.';

const PROMPT_BASE_RELATION_CLASS = 'Please select the relation type';
const PROMPT_MESSAGE_SOURCE_MODEL = 'Please select source model';
const PROMPT_MESSAGE_TARGET_MODEL = 'Please select target model';
const PROMPT_MESSAGE_PROPERTY_NAME =
  'Source property name for the relation getter (will be the relation name)';
const PROMPT_MESSAGE_RELATION_NAME = 'Relation name';
const PROMPT_MESSAGE_FOREIGN_KEY_NAME =
  'Foreign key name to define on the target model';
const PROMPT_MESSAGE_FOREIGN_KEY_NAME_BELONGSTO =
  'Foreign key name to define on the source model';

module.exports = class RelationGenerator extends ArtifactGenerator {
  constructor(args, opts) {
    super(args, opts);
    this.args = args;
    this.opts = opts;
  }

  setOptions() {
    return super.setOptions();
  }

  _setupGenerator() {
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

    this.option('defaultForeignKeyName', {
      type: String,
      required: false,
      description: 'default foreign key name',
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
    this.option('defaultRelationName', {
      type: String,
      required: false,
      description: 'Default relation name',
    });

    this.option('registerInclusionResolver', {
      type: Boolean,
      required: false,
      description:
        'Allow <sourceModel> queries to include data from related <destinationModel>',
    });
    this.artifactInfo = {
      type: 'relation',
      rootDir: utils.sourceRootDir,
      outDir: utils.sourceRootDir,
    };
    // to check if model and repo exist
    this.artifactInfo.modelDir = path.resolve(
      this.artifactInfo.rootDir,
      utils.modelsDir,
    );
    this.artifactInfo.repoDir = path.resolve(
      this.artifactInfo.rootDir,
      utils.repositoriesDir,
    );

    super._setupGenerator();
    this._arguments = [];

    this.isChecked = {
      relationType: false,
      sourceModel: false,
      destinationModel: false,
    };
  }

  checkLoopBackProject() {
    if (this.shouldExit()) return;
    return super.checkLoopBackProject();
  }

  _getDefaultRelationName() {
    let defaultRelationName;
    switch (this.artifactInfo.relationType) {
      case relationUtils.relationType.belongsTo:
        // this is how the belongsToAccessor generates the default relation name
        defaultRelationName = this.artifactInfo.foreignKeyName.replace(
          /Id$/,
          '',
        );
        break;
      case relationUtils.relationType.hasMany:
        defaultRelationName = utils.pluralize(
          utils.camelCase(this.artifactInfo.destinationModel),
        );
        break;
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
      /* istanbul ignore next */
      return this.exit(err);
    }
    let repoList;
    try {
      debug(`repository list dir ${this.artifactInfo.repoDir}`);
      repoList = await utils.getArtifactList(
        this.artifactInfo.repoDir,
        'repository',
      );
    } catch (err) {
      /* istanbul ignore next */
      return this.exit(err);
    }

    if (modelList.length === 0) {
      /* istanbul ignore next */
      return this.exit(
        new Error(
          `${ERROR_NO_MODELS_FOUND} ${this.artifactInfo.modelDir}.
        ${chalk.yellow(
          'Please visit https://loopback.io/doc/en/lb4/Model-generator.html for information on how models are discovered',
        )}`,
        ),
      );
    }

    if (this.options[parameter]) {
      this.isChecked[parameter] = true;
      if (!modelList.includes(this.options[parameter])) {
        /* istanbul ignore next */
        return this.exit(
          new Error(
            `"${this.options[parameter]}" ${ERROR_MODEL_DOES_NOT_EXIST}`,
          ),
        );
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
        when: !this.artifactInfo[parameter],
        default: modelList[0],
      },
    ]).then(props => {
      if (this.isChecked[parameter]) return;
      if (!modelList.includes(props[parameter])) {
        /* istanbul ignore next */
        return this.exit(
          new Error(`"${props[parameter]}" ${ERROR_MODEL_DOES_NOT_EXIST}`),
        );
      }
      // checks if the corresponding repository exists
      if (!repoList.includes(props[parameter])) {
        /* istanbul ignore next */
        return this.exit(
          new Error(
            `${props[parameter]}Repository ${ERROR_REPOSITORY_DOES_NOT_EXIST}`,
          ),
        );
      }

      debug(`props after ${parameter} prompt: ${inspect(props)}`);
      Object.assign(this.artifactInfo, props);
      return props;
    });
  }

  // Prompt a user for Relation type
  async promptRelationType() {
    if (this.shouldExit()) return false;
    const relationTypeChoices = Object.keys(relationUtils.relationType);

    if (this.options.relationType) {
      this.isChecked.relationType = true;
      debug(
        `Relation type received from command line: ${this.options.relationType}`,
      );
      if (!relationTypeChoices.includes(this.options.relationType)) {
        /* istanbul ignore next */
        return this.exit(new Error(ERROR_INCORRECT_RELATION_TYPE));
      }

      this.artifactInfo.relationType = this.options.relationType;
    }

    return this.prompt([
      {
        type: 'list',
        name: 'relationType',
        message: PROMPT_BASE_RELATION_CLASS,
        choices: relationTypeChoices,
        when: !this.artifactInfo.relationType,
        validate: utils.validateClassName,
        default: relationTypeChoices[0],
      },
    ]).then(props => {
      if (this.isChecked.relationType) return;
      if (!relationTypeChoices.includes(props.relationType)) {
        /* istanbul ignore next */
        this.exit(new Error(ERROR_INCORRECT_RELATION_TYPE));
      }
      Object.assign(this.artifactInfo, props);
      debug(`props after relation type prompt: ${inspect(props)}`);
      return props;
    });
  }

  // Get model list for source model.
  async promptSourceModels() {
    if (this.shouldExit()) return false;

    return this._promptModelList(PROMPT_MESSAGE_SOURCE_MODEL, 'sourceModel');
  }

  // Get model list for target model.
  async promptTargetModels() {
    if (this.shouldExit()) return false;

    return this._promptModelList(
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
   *
   * For belongsTo this is getting source key not fk.
   */
  async promptForeignKey() {
    if (this.shouldExit()) return false;

    this.artifactInfo.sourceModelPrimaryKey = await relationUtils.getModelPrimaryKeyProperty(
      this.fs,
      this.artifactInfo.modelDir,
      this.artifactInfo.sourceModel,
    );
    if (!this.artifactInfo.sourceModelPrimaryKey) {
      /* istanbul ignore next */
      return this.exit(
        new Error(ERROR_SOURCE_MODEL_PRIMARY_KEY_DOES_NOT_EXIST),
      );
    }

    if (this.artifactInfo.sourceModelPrimaryKey) {
      this.artifactInfo.sourceModelPrimaryKeyType = relationUtils.getModelPropertyType(
        this.artifactInfo.modelDir,
        this.artifactInfo.sourceModel,
        this.artifactInfo.sourceModelPrimaryKey,
      );
    }

    this.artifactInfo.destinationModelPrimaryKey = await relationUtils.getModelPrimaryKeyProperty(
      this.fs,
      this.artifactInfo.modelDir,
      this.artifactInfo.destinationModel,
    );
    if (!this.artifactInfo.destinationModelPrimaryKey) {
      /* istanbul ignore next */
      return this.exit(
        new Error(ERROR_DESTINATION_MODEL_PRIMARY_KEY_DOES_NOT_EXIST),
      );
    }

    if (this.artifactInfo.destinationModelPrimaryKey) {
      this.artifactInfo.destinationModelPrimaryKeyType = relationUtils.getModelPropertyType(
        this.artifactInfo.modelDir,
        this.artifactInfo.destinationModel,
        this.artifactInfo.destinationModelPrimaryKey,
      );
    }

    // for controller usage;
    this.artifactInfo.targetModelPrimaryKey = await relationUtils.getModelPrimaryKeyProperty(
      this.fs,
      this.artifactInfo.modelDir,
      this.artifactInfo.destinationModel,
    );

    if (this.options.foreignKeyName) {
      debug(
        `Foreign key name received from command line: ${this.options.foreignKeyName}`,
      );
      this.artifactInfo.foreignKeyName = this.options.foreignKeyName;
    }

    this.artifactInfo.defaultForeignKeyName =
      this.artifactInfo.relationType === 'belongsTo'
        ? utils.camelCase(this.artifactInfo.destinationModel) + 'Id'
        : utils.camelCase(this.artifactInfo.sourceModel) + 'Id';

    const msg =
      this.artifactInfo.relationType === 'belongsTo'
        ? PROMPT_MESSAGE_FOREIGN_KEY_NAME_BELONGSTO
        : PROMPT_MESSAGE_FOREIGN_KEY_NAME;
    const foreignKeyModel =
      this.artifactInfo.relationType === 'belongsTo'
        ? this.artifactInfo.sourceModel
        : this.artifactInfo.destinationModel;

    const project = new relationUtils.AstLoopBackProject();
    const fkFile = path.join(
      this.artifactInfo.modelDir,
      utils.getModelFileName(foreignKeyModel),
    );
    const df = project.addSourceFileAtPath(fkFile);
    const cl = relationUtils.getClassObj(df, foreignKeyModel);

    return this.prompt([
      {
        type: 'string',
        name: 'foreignKeyName',
        message: msg,
        default: this.artifactInfo.defaultForeignKeyName,
        when: !this.artifactInfo.foreignKeyName,
        validate: utils.validateKeyName,
      },
    ]).then(props => {
      debug(`props after foreign key name prompt: ${inspect(props)}`);
      Object.assign(this.artifactInfo, props);
      this.artifactInfo.doesForeignKeyExist = relationUtils.doesPropertyExist(
        cl,
        this.artifactInfo.foreignKeyName,
      );
      // checks if its the case that the fk already exists in source model and decorated by @belongsTo, which should be aborted
      if (
        this.artifactInfo.doesForeignKeyExist &&
        this.artifactInfo.relationType === 'belongsTo'
      ) {
        try {
          relationUtils.doesRelationExist(cl, this.artifactInfo.foreignKeyName);
        } catch (err) {
          /* istanbul ignore next */
          this.exit(err);
        }
      }
      return props;
    });
  }

  async promptRelationName() {
    if (this.shouldExit()) return false;
    if (this.options.relationName) {
      debug(
        `Relation name received from command line: ${this.options.relationName}`,
      );
      this.artifactInfo.relationName = this.options.relationName;
    }
    this.artifactInfo.defaultRelationName = this._getDefaultRelationName();
    // for hasMany && hasOne, the source key is the same as the relation name
    const msg =
      this.artifactInfo.relationType === 'belongsTo'
        ? PROMPT_MESSAGE_RELATION_NAME
        : PROMPT_MESSAGE_PROPERTY_NAME;

    return this.prompt([
      {
        type: 'string',
        name: 'relationName',
        message: msg,
        when: !this.artifactInfo.relationName,
        default: this.artifactInfo.defaultRelationName,
        validate: inputName =>
          utils.validateRelationName(
            inputName,
            this.artifactInfo.relationType,
            this.artifactInfo.foreignKeyName,
          ),
      },
    ]).then(props => {
      debug(`props after relation name prompt: ${inspect(props)}`);
      // checks if the relation name already exists
      this.artifactInfo.srcRepositoryFile = path.resolve(
        this.artifactInfo.repoDir,
        utils.getRepositoryFileName(this.artifactInfo.sourceModel),
      );
      this.artifactInfo.srcRepositoryClassName =
        utils.toClassName(this.artifactInfo.sourceModel) + 'Repository';
      this.artifactInfo.srcRepositoryFileObj = new relationUtils.AstLoopBackProject().addSourceFileAtPath(
        this.artifactInfo.srcRepositoryFile,
      );

      const repoClassDeclaration = this.artifactInfo.srcRepositoryFileObj.getClassOrThrow(
        this.artifactInfo.srcRepositoryClassName,
      );
      // checks if the relation name already exists in repo
      if (
        relationUtils.doesPropertyExist(
          repoClassDeclaration,
          props.relationName,
        )
      ) {
        /* istanbul ignore next */
        return this.exit(
          new Error(
            `relation ${props.relationName} already exists in the repository ${this.artifactInfo.srcRepositoryClassName}.`,
          ),
        );
      }

      Object.assign(this.artifactInfo, props);
      return props;
    });
  }

  async promptRegisterInclusionResolver() {
    if (this.shouldExit()) return false;
    const props = await this.prompt([
      {
        type: 'confirm',
        name: 'registerInclusionResolver',
        message: `Allow ${chalk.yellow(
          this.artifactInfo.sourceModel,
        )} queries to include data from related ${chalk.yellow(
          this.artifactInfo.destinationModel,
        )} instances?`,
        default: true,
      },
    ]);
    debug(`props after inclusion resolver promps: ${inspect(props)}`);
    Object.assign(this.artifactInfo, props);
    return props;
  }

  async scaffold() {
    if (this.shouldExit()) return false;

    debug('Invoke generator...');

    let relationGenerator;

    this.artifactInfo.name = this.artifactInfo.relationType;

    switch (this.artifactInfo.relationType) {
      case relationUtils.relationType.belongsTo:
        relationGenerator = new BelongsToRelationGenerator(
          this.args,
          this.opts,
        );
        break;
      case relationUtils.relationType.hasMany:
        relationGenerator = new HasManyRelationGenerator(this.args, this.opts);
        break;
    }

    try {
      await relationGenerator.generateAll(this.artifactInfo);
    } catch (error) {
      /* istanbul ignore next */
      this.exit(error);
    }
  }

  async end() {
    await super.end();
  }
};
