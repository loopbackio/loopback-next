// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// no translation: HasMany, BelongsTo, HasOne
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
const HasManyThroughRelationGenerator = require('./has-many-through-relation.generator');
const HasOneRelationGenerator = require('./has-one-relation.generator');

const g = require('../../lib/globalize');

const ERROR_INCORRECT_RELATION_TYPE = g.f('Incorrect relation type');
const ERROR_MODEL_DOES_NOT_EXIST = g.f('model does not exist.');
const ERROR_NO_MODELS_FOUND = g.f('No models found in');
const ERROR_REPOSITORY_DOES_NOT_EXIST = g.f(
  'class does not exist. Please create repository first with "lb4 repository" command.',
);

const PROMPT_BASE_RELATION_CLASS = g.f('Please select the relation type');
const PROMPT_MESSAGE_SOURCE_MODEL = g.f('Please select source model');
const PROMPT_MESSAGE_TARGET_MODEL = g.f('Please select target model');
const PROMPT_MESSAGE_THROUGH_MODEL = g.f('Please select through model');
const PROMPT_MESSAGE_PROPERTY_NAME = g.f(
  'Source property name for the relation getter (will be the relation name)',
);
const PROMPT_MESSAGE_RELATION_NAME = g.f('Relation name');
const PROMPT_MESSAGE_FOREIGN_KEY_NAME = g.f(
  'Foreign key name to define on the target model',
);
const PROMPT_MESSAGE_FOREIGN_KEY_NAME_BELONGSTO = g.f(
  'Foreign key name to define on the source model',
);

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
      description: g.f('Relation type'),
    });

    this.option('sourceModel', {
      type: String,
      required: false,
      description: g.f('Source model'),
    });

    this.option('destinationModel', {
      type: String,
      required: false,
      description: g.f('Destination model'),
    });

    this.option('throughModel', {
      type: String,
      required: false,
      description: g.f('Through model'),
    });

    this.option('sourceModelPrimaryKey', {
      type: String,
      required: false,
      description: g.f('Primary key on source model'),
    });

    this.option('sourceModelPrimaryKeyType', {
      type: String,
      required: false,
      description: g.f('Type of the primary key on source model'),
    });

    this.option('destinationModelPrimaryKey', {
      type: String,
      required: false,
      description: g.f('Primary key on destination model'),
    });

    this.option('destinationModelPrimaryKeyType', {
      type: String,
      required: false,
      description: g.f('Type of the primary key on destination model'),
    });

    this.option('sourceKeyOnThrough', {
      type: String,
      required: false,
      description: g.f('Foreign key references source model on through model'),
    });

    this.option('targetKeyOnThrough', {
      type: String,
      required: false,
      description: g.f('Foreign key references target model on through model'),
    });

    this.option('defaultForeignKeyName', {
      type: String,
      required: false,
      description: g.f('default foreign key name'),
    });

    this.option('foreignKeyName', {
      type: String,
      required: false,
      description: g.f('Destination model foreign key name'),
    });

    this.option('relationName', {
      type: String,
      required: false,
      description: g.f('Relation name'),
    });
    this.option('defaultRelationName', {
      type: String,
      required: false,
      description: g.f('Default relation name'),
    });

    this.option('registerInclusionResolver', {
      type: Boolean,
      required: false,
      description: g.f(
        'Allow <sourceModel> queries to include data from related <destinationModel>',
      ),
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
      case relationUtils.relationType.hasManyThrough:
        defaultRelationName = utils.pluralize(
          utils.camelCase(this.artifactInfo.destinationModel),
        );
        break;
      case relationUtils.relationType.hasOne:
        defaultRelationName = utils.camelCase(
          this.artifactInfo.destinationModel,
        );
        break;
    }

    return defaultRelationName;
  }

  async _promptModelList(message, parameter, toRemove = []) {
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
    // remove source & target models from the selections of through model
    if (toRemove.length > 0) {
      const updateAry = [];
      modelList.forEach(ele => {
        if (!toRemove.includes(ele)) {
          updateAry.push(ele);
        }
      });
      modelList = updateAry;
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

  // Get model list for through model.
  async promptThroughModels() {
    if (this.shouldExit()) return false;
    if (this.artifactInfo.relationType === 'hasManyThrough') {
      return this._promptModelList(
        PROMPT_MESSAGE_THROUGH_MODEL,
        'throughModel',
        [this.artifactInfo.destinationModel, this.artifactInfo.sourceModel],
      );
    }
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

    if (this.options.sourceModelPrimaryKey) {
      this.artifactInfo.sourceModelPrimaryKey =
        this.options.sourceModelPrimaryKey;
    }
    if (this.options.sourceModelPrimaryKeyType) {
      this.artifactInfo.sourceModelPrimaryKeyType =
        this.options.sourceModelPrimaryKeyType;
    }
    if (this.options.destinationModelPrimaryKey) {
      this.artifactInfo.destinationModelPrimaryKey =
        this.options.destinationModelPrimaryKey;
    }
    if (this.options.destinationModelPrimaryKeyType) {
      this.artifactInfo.destinationModelPrimaryKeyType =
        this.options.destinationModelPrimaryKeyType;
    }

    if (!this.artifactInfo.sourceModelPrimaryKey) {
      const sourceModelPK = await relationUtils.getModelPrimaryKeyProperty(
        this.fs,
        this.artifactInfo.modelDir,
        this.artifactInfo.sourceModel,
      );
      if (sourceModelPK) {
        this.artifactInfo.sourceModelPrimaryKey = sourceModelPK;
        if (!this.artifactInfo.sourceModelPrimaryKeyType) {
          const sourceModelPKType = relationUtils.getModelPropertyType(
            this.artifactInfo.modelDir,
            this.artifactInfo.sourceModel,
            this.artifactInfo.sourceModelPrimaryKey,
          );
          if (sourceModelPKType) {
            this.artifactInfo.sourceModelPrimaryKeyType = sourceModelPKType;
          }
        }
      } else {
        const answer = await this.prompt([
          {
            type: 'input',
            name: 'sourceModelPrimaryKey',
            message: g.f(
              'What is the name of ID property of the source model?',
            ),
            when: this.artifactInfo.sourceModelPrimaryKey === undefined,
            default: 'id',
          },
        ]);
        this.artifactInfo.sourceModelPrimaryKey = answer.sourceModelPrimaryKey;
      }
    }
    if (!this.artifactInfo.sourceModelPrimaryKeyType) {
      const answer = await this.prompt([
        {
          type: 'list',
          name: 'sourceModelPrimaryKeyType',
          message: g.f('What is the type of the source model primary key?'),
          choices: ['number', 'string', 'object'],
          when: this.artifactInfo.sourceModelPrimaryKeyType === undefined,
          default: 'number',
        },
      ]);
      this.artifactInfo.sourceModelPrimaryKeyType =
        answer.sourceModelPrimaryKeyType;
    }

    debug(
      `source model primary key and type: ${this.artifactInfo.destinationModelPrimaryKey}
      ${this.artifactInfo.destinationModelPrimaryKeyType}`,
    );

    if (!this.artifactInfo.destinationModelPrimaryKey) {
      const destModelPK = await relationUtils.getModelPrimaryKeyProperty(
        this.fs,
        this.artifactInfo.modelDir,
        this.artifactInfo.destinationModel,
      );
      if (destModelPK) {
        this.artifactInfo.destinationModelPrimaryKey = destModelPK;
        if (!this.artifactInfo.destinationModelPrimaryKeyType) {
          const destModelPKType = relationUtils.getModelPropertyType(
            this.artifactInfo.modelDir,
            this.artifactInfo.destinationModel,
            this.artifactInfo.destinationModelPrimaryKey,
          );
          if (destModelPKType) {
            this.artifactInfo.destinationModelPrimaryKeyType = destModelPKType;
          }
        }
      } else {
        const answer = await this.prompt([
          {
            type: 'input',
            name: 'destinationModelPrimaryKey',
            message: g.f(
              'What is the name of ID property of the target model?',
            ),
            when: this.artifactInfo.destinationModelPrimaryKey === undefined,
            default: 'id',
          },
        ]);
        this.artifactInfo.destinationModelPrimaryKey =
          answer.destinationModelPrimaryKey;
      }
    }
    if (!this.artifactInfo.destinationModelPrimaryKeyType) {
      const answer = await this.prompt([
        {
          type: 'list',
          name: 'destinationModelPrimaryKeyType',
          message: g.f('What is the type of the target model primary key?'),
          choices: ['number', 'string', 'object'],
          when: this.artifactInfo.destinationModelPrimaryKeyType === undefined,
          default: 'number',
        },
      ]);
      this.artifactInfo.destinationModelPrimaryKeyType =
        answer.destinationModelPrimaryKeyType;
    }

    debug(
      `destination model primary key and type: ${this.artifactInfo.destinationModelPrimaryKey}
      ${this.artifactInfo.destinationModelPrimaryKeyType}`,
    );

    // checks fks for hasManyThrough
    if (this.artifactInfo.relationType === 'hasManyThrough') {
      this.artifactInfo.defaultSourceKeyOnThrough =
        utils.camelCase(this.artifactInfo.sourceModel) + 'Id';
      this.artifactInfo.defaultTargetKeyOnThrough =
        utils.camelCase(this.artifactInfo.destinationModel) + 'Id';
      return this._promptKeyFromOnThroughModel();
    }

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

  async _promptKeyFromOnThroughModel() {
    if (this.shouldExit()) return false;
    return this.prompt([
      {
        type: 'string',
        name: 'sourceKeyOnThrough',
        message: g.f(
          `Foreign key name that references the ${chalk.yellow(
            'source model',
          )} to define on the through model`,
        ),
        default: this.artifactInfo.defaultSourceKeyOnThrough,
        when: !this.options.sourceKeyOnThrough,
        validate: utils.validateKeyName,
      },
    ]).then(props => {
      debug(`props after foreign key name prompt: ${inspect(props)}`);
      Object.assign(this.artifactInfo, props);
      return this._promptKeyToOnThroughModel();
    });
  }

  async _promptKeyToOnThroughModel() {
    if (this.shouldExit()) return false;
    return this.prompt([
      {
        type: 'string',
        name: 'targetKeyOnThrough',
        message: g.f(
          `Foreign key name that references the ${chalk.yellow(
            'target model',
          )} to define on the through model`,
        ),
        default: this.artifactInfo.defaultTargetKeyOnThrough,
        when: !this.options.targetKeyOnThrough,
        validate: input =>
          utils.validateKeyToKeyFrom(
            input,
            this.artifactInfo.sourceKeyOnThrough,
          ),
      },
    ]).then(props => {
      debug(`props after foreign key name prompt: ${inspect(props)}`);
      Object.assign(this.artifactInfo, props);
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
      this.artifactInfo.srcRepositoryFileObj =
        new relationUtils.AstLoopBackProject().addSourceFileAtPath(
          this.artifactInfo.srcRepositoryFile,
        );

      const repoClassDeclaration =
        this.artifactInfo.srcRepositoryFileObj.getClassOrThrow(
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
        message: g.f(
          'Allow %s queries to include data from related %s instances? ',
          chalk.yellow(this.artifactInfo.sourceModel),
          chalk.yellow(this.artifactInfo.destinationModel),
        ),
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
      case relationUtils.relationType.hasManyThrough:
        relationGenerator = new HasManyThroughRelationGenerator(
          this.args,
          this.opts,
        );
        break;
      case relationUtils.relationType.hasOne:
        relationGenerator = new HasOneRelationGenerator(this.args, this.opts);
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
