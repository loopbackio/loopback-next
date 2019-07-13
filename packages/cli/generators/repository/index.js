// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const _ = require('lodash');
const ArtifactGenerator = require('../../lib/artifact-generator');
const fs = require('fs');
const debug = require('../../lib/debug')('repository-generator');
const inspect = require('util').inspect;
const path = require('path');
const chalk = require('chalk');
const utils = require('../../lib/utils');
const tsquery = require('../../lib/ast-helper');

const VALID_CONNECTORS_FOR_REPOSITORY = ['KeyValueModel', 'PersistedModel'];
const KEY_VALUE_CONNECTOR = ['KeyValueModel'];

const DEFAULT_CRUD_REPOSITORY = 'DefaultCrudRepository';
const KEY_VALUE_REPOSITORY = 'DefaultKeyValueRepository';
const BASE_REPOSITORIES = [DEFAULT_CRUD_REPOSITORY, KEY_VALUE_REPOSITORY];
const CLI_BASE_CRUD_REPOSITORIES = [
  {
    name: `${DEFAULT_CRUD_REPOSITORY} ${chalk.gray('(Legacy juggler bridge)')}`,
    value: DEFAULT_CRUD_REPOSITORY,
  },
];
const CLI_BASE_KEY_VALUE_REPOSITORIES = [
  {
    name: `${KEY_VALUE_REPOSITORY} ${chalk.gray(
      '(For access to a key-value store)',
    )}`,
    value: KEY_VALUE_REPOSITORY,
  },
];
const CLI_BASE_SEPARATOR = [
  {
    type: 'separator',
    line: '----- Custom Repositories -----',
  },
];

const REPOSITORY_KV_TEMPLATE = 'repository-kv-template.ts.ejs';
const REPOSITORY_CRUD_TEMPLATE = 'repository-crud-default-template.ts.ejs';

const PROMPT_MESSAGE_MODEL =
  'Select the model(s) you want to generate a repository';
const PROMPT_MESSAGE_DATA_SOURCE = 'Please select the datasource';
const PROMPT_BASE_REPOSITORY_CLASS = 'Please select the repository base class';
const ERROR_READING_FILE = 'Error reading file';
const ERROR_NO_DATA_SOURCES_FOUND = 'No datasources found at';
const ERROR_NO_MODELS_FOUND = 'No models found at';
const ERROR_NO_MODEL_SELECTED = 'You did not select a valid model';

module.exports = class RepositoryGenerator extends ArtifactGenerator {
  // Note: arguments and options should be defined in the constructor.
  constructor(args, opts) {
    super(args, opts);
  }

  /**
   * Find all the base artifacts in the given path whose type matches the
   * provided artifactType.
   * For example, a artifactType of "repository" will search the target path for
   * matches to "*.repository.base.ts"
   * @param {string} dir The target directory from which to load artifacts.
   * @param {string} artifactType The artifact type (ex. "model", "repository")
   */
  async _findBaseClasses(dir, artifactType) {
    const paths = await utils.findArtifactPaths(dir, artifactType + '.base');
    debug(`repository artifact paths: ${paths}`);

    // get base class and path
    const baseRepositoryList = [];
    for (const p of paths) {
      //get name removing anything from .artifactType.base
      const artifactFile = path.parse(_.last(_.split(p, path.sep))).name;
      const firstWord = _.first(_.split(artifactFile, '.'));
      const artifactName =
        utils.toClassName(firstWord) + utils.toClassName(artifactType);

      const baseRepository = {name: artifactName, file: artifactFile};
      baseRepositoryList.push(baseRepository);
    }

    debug(`repository base classes: ${inspect(baseRepositoryList)}`);
    return baseRepositoryList;
  }

  /**
   * get the property name for the id field
   * @param {string} modelName
   */
  async _getModelIdProperty(modelName) {
    let fileContent = '';
    const modelFile = path.join(
      this.artifactInfo.modelDir,
      utils.getModelFileName(modelName),
    );
    try {
      fileContent = this.fs.read(modelFile, {});
    } catch (err) {
      debug(`${ERROR_READING_FILE} ${modelFile}: ${err.message}`);
      return this.exit(err);
    }

    return tsquery.getIdFromModel(fileContent);
  }

  /**
   * helper method to inspect and validate a repository type
   */
  async _inferRepositoryType() {
    if (!this.artifactInfo.dataSourceClass) {
      return;
    }
    const result = utils.isConnectorOfType(
      KEY_VALUE_CONNECTOR,
      this.artifactInfo.datasourcesDir,
      this.artifactInfo.dataSourceClass,
    );
    debug(`KeyValue Connector: ${result}`);

    if (result) {
      this.artifactInfo.repositoryTypeClass = KEY_VALUE_REPOSITORY;
      this.artifactInfo.defaultTemplate = REPOSITORY_KV_TEMPLATE;
    } else {
      this.artifactInfo.repositoryTypeClass = DEFAULT_CRUD_REPOSITORY;
      this.artifactInfo.defaultTemplate = REPOSITORY_CRUD_TEMPLATE;
    }

    this.artifactInfo.dataSourceName = utils.getDataSourceName(
      this.artifactInfo.datasourcesDir,
      this.artifactInfo.dataSourceClass,
    );

    this.artifactInfo.dataSourceClassName =
      utils.toClassName(this.artifactInfo.dataSourceName) + 'DataSource';
  }

  _setupGenerator() {
    this.artifactInfo = {
      type: 'repository ',
      rootDir: utils.sourceRootDir,
    };

    this.artifactInfo.outDir = path.resolve(
      this.artifactInfo.rootDir,
      utils.repositoriesDir,
    );
    this.artifactInfo.datasourcesDir = path.resolve(
      this.artifactInfo.rootDir,
      utils.datasourcesDir,
    );
    this.artifactInfo.modelDir = path.resolve(
      this.artifactInfo.rootDir,
      utils.modelsDir,
    );

    // to be able to write multiple files to the index.ts
    this.artifactInfo.indexesToBeUpdated = [];

    this.artifactInfo.defaultTemplate = REPOSITORY_CRUD_TEMPLATE;

    this.option('model', {
      type: String,
      required: false,
      description: 'A valid model name',
    });

    this.option('id', {
      type: String,
      required: false,
      description: 'A valid ID property name for the specified model',
    });

    this.option('datasource', {
      type: String,
      required: false,
      description: 'A valid datasource name',
    });

    this.option('repositoryBaseClass', {
      type: String,
      required: false,
      description: 'A valid repository base class',
      default: 'DefaultCrudRepository',
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

  async checkPaths() {
    if (this.shouldExit()) return;
    // check for datasources
    if (!fs.existsSync(this.artifactInfo.datasourcesDir)) {
      return this.exit(
        new Error(
          `${ERROR_NO_DATA_SOURCES_FOUND} ${this.artifactInfo.datasourcesDir}.
        ${chalk.yellow(
          'Please visit https://loopback.io/doc/en/lb4/DataSource-generator.html for information on how datasources are discovered',
        )}`,
        ),
      );
    }

    // check for models
    if (!fs.existsSync(this.artifactInfo.modelDir)) {
      return this.exit(
        new Error(
          `${ERROR_NO_MODELS_FOUND} ${this.artifactInfo.modelDir}.
        ${chalk.yellow(
          'Please visit https://loopback.io/doc/en/lb4/Model-generator.html for information on how models are discovered',
        )}`,
        ),
      );
    }
  }

  async promptDataSourceName() {
    if (this.shouldExit()) return false;

    debug('Prompting for a datasource ');
    let datasourcesList;

    // grab the datasourcename from the command line
    const cmdDatasourceName = this.options.datasource
      ? utils.toClassName(this.options.datasource) + 'Datasource'
      : '';

    debug(`command line datasource is  ${cmdDatasourceName}`);

    try {
      datasourcesList = await utils.getArtifactList(
        this.artifactInfo.datasourcesDir,
        'datasource',
        true,
      );
      debug(
        `datasourcesList from ${utils.sourceRootDir}/${utils.datasourcesDir} : ${datasourcesList}`,
      );
    } catch (err) {
      return this.exit(err);
    }

    const availableDatasources = datasourcesList.filter(item => {
      debug(`data source inspecting item: ${item}`);
      const result = utils.isConnectorOfType(
        VALID_CONNECTORS_FOR_REPOSITORY,
        this.artifactInfo.datasourcesDir,
        item,
      );
      return result !== false;
    });

    debug(`artifactInfo.dataSourceClass ${this.artifactInfo.dataSourceClass}`);

    if (availableDatasources.length === 0) {
      return this.exit(
        new Error(
          `${ERROR_NO_DATA_SOURCES_FOUND} ${this.artifactInfo.datasourcesDir}.
        ${chalk.yellow(
          'Please visit https://loopback.io/doc/en/lb4/DataSource-generator.html for information on how datasources are discovered',
        )}`,
        ),
      );
    }

    if (availableDatasources.includes(cmdDatasourceName)) {
      Object.assign(this.artifactInfo, {
        dataSourceClass: cmdDatasourceName,
      });
    }

    return this.prompt([
      {
        type: 'list',
        name: 'dataSourceClass',
        message: PROMPT_MESSAGE_DATA_SOURCE,
        choices: availableDatasources,
        when: !this.artifactInfo.dataSourceClass,
        default: availableDatasources[0],
        validate: utils.validateClassName,
      },
    ])
      .then(props => {
        Object.assign(this.artifactInfo, props);
        debug(`props after datasource prompt: ${inspect(props)}`);
        return props;
      })
      .catch(err => {
        debug(`Error during datasource prompt: ${err}`);
        return this.exit(err);
      });
  }

  async promptModels() {
    if (this.shouldExit()) return false;

    await this._inferRepositoryType();

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

    if (this.options.model) {
      debug(`Model name received from command line: ${this.options.model}`);

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

    return this.prompt([
      {
        type: 'checkbox',
        name: 'modelNameList',
        message: PROMPT_MESSAGE_MODEL,
        choices: modelList,
        when: this.artifactInfo.modelNameList === undefined,
      },
    ])
      .then(props => {
        Object.assign(this.artifactInfo, props);
        debug(`props after model list prompt: ${inspect(props)}`);
        return props;
      })
      .catch(err => {
        debug(`Error during model list prompt: ${err}`);
        return this.exit(err);
      });
  }

  async promptBaseClass() {
    debug('Prompting for repository base');
    if (this.shouldExit()) return;

    const availableRepositoryList = [];

    debug(`repositoryTypeClass ${this.artifactInfo.repositoryTypeClass}`);
    // Add base repositories based on datasource type
    if (this.artifactInfo.repositoryTypeClass === KEY_VALUE_REPOSITORY)
      availableRepositoryList.push(...CLI_BASE_KEY_VALUE_REPOSITORIES);
    else availableRepositoryList.push(...CLI_BASE_CRUD_REPOSITORIES);
    availableRepositoryList.push(...CLI_BASE_SEPARATOR);

    try {
      this.artifactInfo.baseRepositoryList = await this._findBaseClasses(
        this.artifactInfo.outDir,
        'repository',
      );
      if (
        this.artifactInfo.baseRepositoryList &&
        this.artifactInfo.baseRepositoryList.length > 0
      ) {
        availableRepositoryList.push(...this.artifactInfo.baseRepositoryList);
        debug(`availableRepositoryList ${availableRepositoryList}`);
      }
    } catch (err) {
      return this.exit(err);
    }

    if (this.options.repositoryBaseClass) {
      debug(
        `Base repository received from command line: ${this.options.repositoryBaseClass}`,
      );
      this.artifactInfo.repositoryBaseClass = this.options.repositoryBaseClass;
    }

    return this.prompt([
      {
        type: 'list',
        name: 'repositoryBaseClass',
        message: PROMPT_BASE_REPOSITORY_CLASS,
        choices: availableRepositoryList,
        default:
          this.artifactInfo.repositoryBaseClass === undefined
            ? availableRepositoryList[0]
            : this.options.repositoryBaseClass,
      },
    ])
      .then(props => {
        debug(`props after custom repository prompt: ${inspect(props)}`);
        Object.assign(this.artifactInfo, props);
        return props;
      })
      .catch(err => {
        debug(`Error during repository base class prompt: ${err.stack}`);
        return this.exit(err);
      });
  }

  async promptModelId() {
    if (this.shouldExit()) return false;
    let idProperty;

    debug(`Model ID property name from command line: ${this.options.id}`);
    debug(`Selected Models: ${this.artifactInfo.modelNameList}`);

    if (_.isEmpty(this.artifactInfo.modelNameList)) {
      return this.exit(new Error(`${ERROR_NO_MODEL_SELECTED}`));
    } else {
      // iterate thru each selected model, infer or ask for the ID type
      for (const item of this.artifactInfo.modelNameList) {
        this.artifactInfo.modelName = item;

        const prompts = [
          {
            type: 'input',
            name: 'propertyName',
            message: `Please enter the name of the ID property for ${item}:`,
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
          idProperty = await this._getModelIdProperty(item);
          if (idProperty === null) {
            const answer = await this.prompt(prompts);
            idProperty = answer.propertyName;
          }
        }
        this.artifactInfo.idProperty = idProperty;
        // Generate this repository
        await this._scaffold();
      }
    }
  }

  async _scaffold() {
    if (this.shouldExit()) return false;

    this.artifactInfo.isRepositoryBaseBuiltin = BASE_REPOSITORIES.includes(
      this.artifactInfo.repositoryBaseClass,
    );
    debug(
      `isRepositoryBaseBuiltin : ${this.artifactInfo.isRepositoryBaseBuiltin}`,
    );
    if (!this.artifactInfo.isRepositoryBaseBuiltin) {
      const baseIndex = _.findIndex(this.artifactInfo.baseRepositoryList, [
        'name',
        this.artifactInfo.repositoryBaseClass,
      ]);
      this.artifactInfo.repositoryBaseFile = this.artifactInfo.baseRepositoryList[
        baseIndex
      ].file;
    }

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
      debug(`artifactInfo: ${inspect(this.artifactInfo)}`);
      debug(`Copying artifact to: ${dest}`);
    }

    this.copyTemplatedFiles(source, dest, this.artifactInfo);
    return;
  }

  async end() {
    this.artifactInfo.type =
      this.artifactInfo.modelNameList &&
      this.artifactInfo.modelNameList.length > 1
        ? 'Repositories'
        : 'Repository';

    this.artifactInfo.modelNameList = _.map(
      this.artifactInfo.modelNameList,
      repositoryName => {
        return repositoryName + 'Repository';
      },
    );

    this.artifactInfo.name = this.artifactInfo.modelNameList
      ? this.artifactInfo.modelNameList.join(this.classNameSeparator)
      : this.artifactInfo.modelName;

    await super.end();
  }
};
