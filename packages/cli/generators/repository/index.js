// Copyright IBM Corp. 2017,2018. All Rights Reserved.
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
const connectors = require('../datasource/connectors.json');
const tsquery = require('../../lib/ast-helper');

const VALID_CONNECTORS_FOR_REPOSITORY = ['KeyValueModel', 'PersistedModel'];
const KEY_VALUE_CONNECTOR = ['KeyValueModel'];

const DEFAULT_CRUD_REPOSITORY = 'DefaultCrudRepository';
const KEY_VALUE_REPOSITORY = 'DefaultKeyValueRepository';

const REPOSITORY_KV_TEMPLATE = 'repository-kv-template.ts.ejs';
const REPOSITORY_CRUD_TEMPLATE = 'repository-crud-default-template.ts.ejs';

const PROMPT_MESSAGE_MODEL =
  'Select the model(s) you want to generate a repository';
const PROMPT_MESSAGE_DATA_SOURCE = 'Please select the datasource';
const ERROR_READING_FILE = 'Error reading file';
const ERROR_NO_DATA_SOURCES_FOUND = 'No datasources found in';
const ERROR_NO_MODELS_FOUND = 'No models found in';
const ERROR_NO_MODEL_SELECTED = 'You did not select a valid model';
const ERROR_NO_DIRECTORY = 'The directory was not found';

module.exports = class RepositoryGenerator extends ArtifactGenerator {
  // Note: arguments and options should be defined in the constructor.
  constructor(args, opts) {
    super(args, opts);
  }

  /**
   * get the property name for the id field
   * @param {string} modelName
   */
  async _getModelIdType(modelName) {
    let fileContent = '';
    let modelFile = path.join(
      this.artifactInfo.modelDir,
      `${utils.kebabCase(modelName)}.model.ts`,
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
    if (!this.artifactInfo.dataSourceClassName) {
      return;
    }
    let result = this._isConnectorOfType(
      KEY_VALUE_CONNECTOR,
      this.artifactInfo.dataSourceClassName,
    );
    debug(`KeyValue Connector: ${result}`);

    if (result) {
      this.artifactInfo.repositoryTypeClass = KEY_VALUE_REPOSITORY;
      this.artifactInfo.defaultTemplate = REPOSITORY_KV_TEMPLATE;
    } else {
      this.artifactInfo.repositoryTypeClass = DEFAULT_CRUD_REPOSITORY;
      this.artifactInfo.defaultTemplate = REPOSITORY_CRUD_TEMPLATE;
    }

    // assign the data source name to the information artifact
    let dataSourceName = this.artifactInfo.dataSourceClassName
      .replace('Datasource', '')
      .toLowerCase();
    let dataSourceImportName = this.artifactInfo.dataSourceClassName.replace(
      'Datasource',
      'DataSource',
    );

    Object.assign(this.artifactInfo, {
      dataSourceImportName: dataSourceImportName,
    });
    Object.assign(this.artifactInfo, {
      dataSourceName: dataSourceName,
    });
  }

  /**
   * load the connectors available and check if the basedModel matches any
   * connectorType supplied for the given connector name
   * @param {string} connectorType single or a comma separated string array
   */
  _isConnectorOfType(connectorType, dataSourceClassName) {
    debug(`calling isConnectorType ${connectorType}`);
    let jsonFileContent = '';
    let result = false;

    if (!dataSourceClassName) {
      return false;
    }
    let datasourceJSONFile = path.join(
      this.artifactInfo.datasourcesDir,
      dataSourceClassName
        .replace('Datasource', '.datasource.json')
        .toLowerCase(),
    );

    try {
      jsonFileContent = this.fs.readJSON(datasourceJSONFile, {});
    } catch (err) {
      debug(`${ERROR_READING_FILE} ${datasourceJSONFile}: ${err.message}`);
      return this.exit(err);
    }

    for (let connector of Object.values(connectors)) {
      const matchedConnector =
        jsonFileContent.connector === connector.name ||
        jsonFileContent.connector === `loopback-connector-${connector.name}`;

      if (matchedConnector && connectorType.includes(connector.baseModel)) {
        result = true;
        break;
      }
    }

    return result;
  }

  _setupGenerator() {
    this.artifactInfo = {
      type: 'repository ',
      rootDir: 'src',
    };

    this.artifactInfo.outDir = path.resolve(
      this.artifactInfo.rootDir,
      'repositories',
    );
    this.artifactInfo.datasourcesDir = path.resolve(
      this.artifactInfo.rootDir,
      'datasources',
    );
    this.artifactInfo.modelDir = path.resolve(
      this.artifactInfo.rootDir,
      'models',
    );

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

    return super._setupGenerator();
  }

  setOptions() {
    return super.setOptions();
  }

  async checkPaths() {
    // check for datasources
    if (!fs.existsSync(this.artifactInfo.datasourcesDir)) {
      return this.exit(
        new Error(
          `${ERROR_NO_DIRECTORY} ${this.artifactInfo.datasourcesDir}.
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
          `${ERROR_NO_DIRECTORY} ${this.artifactInfo.modelDir}.
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
    let cmdDatasourceName;
    let datasourcesList;

    // grab the datasourcename from the command line
    cmdDatasourceName = this.options.datasource
      ? utils.toClassName(this.options.datasource) + 'Datasource'
      : '';

    debug(`command line datasource is  ${cmdDatasourceName}`);

    try {
      datasourcesList = await utils.getArtifactList(
        this.artifactInfo.datasourcesDir,
        'datasource',
        true,
      );
      debug(`datasourcesList from src/datasources : ${datasourcesList}`);
    } catch (err) {
      return this.exit(err);
    }

    const availableDatasources = datasourcesList.filter(item => {
      debug(`data source unfiltered list: ${item}`);
      const result = this._isConnectorOfType(
        VALID_CONNECTORS_FOR_REPOSITORY,
        item,
      );
      return result;
    });

    if (availableDatasources.includes(cmdDatasourceName)) {
      Object.assign(this.artifactInfo, {
        dataSourceClassName: cmdDatasourceName,
      });
    }

    debug(
      `artifactInfo.dataSourceClassName ${
        this.artifactInfo.dataSourceClassName
      }`,
    );

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

    return this.prompt([
      {
        type: 'list',
        name: 'dataSourceClassName',
        message: PROMPT_MESSAGE_DATA_SOURCE,
        choices: availableDatasources,
        when: !this.artifactInfo.dataSourceClassName,
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
      if (modelList.length > 0 && modelList.includes(this.options.model)) {
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

  async promptModelId() {
    if (this.shouldExit()) return false;
    let idType;

    debug(`Model ID property name from command line: ${this.options.id}`);
    debug(`Selected Models: ${this.artifactInfo.modelNameList}`);

    if (_.isEmpty(this.artifactInfo.modelNameList)) {
      return this.exit(new Error(`${ERROR_NO_MODEL_SELECTED}`));
    } else {
      // iterate thru each selected model, infer or ask for the ID type
      for (let item of this.artifactInfo.modelNameList) {
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

          idType = this.options.id;
          /**  make sure it is only used once, in case user selected more
           * than one model.
           */
          delete this.options.id;
        } else {
          idType = await this._getModelIdType(item);
          if (idType === null) {
            const answer = await this.prompt(prompts);
            idType = answer.propertyName;
          }
        }
        this.artifactInfo.idType = idType;
        // Generate this repository
        await this._scaffold();
      }
    }
  }

  async _scaffold() {
    if (this.shouldExit()) return false;

    if (this.options.name) {
      this.artifactInfo.className = utils.toClassName(this.options.name);
      this.artifactInfo.outFile =
        utils.kebabCase(this.options.name) + '.repository.ts';

      // make sure the name supplied from cmd line is only used once
      delete this.options.name;
    } else {
      this.artifactInfo.className = utils.toClassName(
        this.artifactInfo.modelName,
      );
      this.artifactInfo.outFile =
        utils.kebabCase(this.artifactInfo.modelName) + '.repository.ts';
    }

    if (debug.enabled) {
      debug(`Artifact output filename set to: ${this.artifactInfo.outFile}`);
    }

    const source = this.templatePath(
      path.join('src', 'repositories', this.artifactInfo.defaultTemplate),
    );

    if (debug.enabled) {
      debug(`Using template at: ${source}`);
    }
    const dest = this.destinationPath(
      path.join(this.artifactInfo.outDir, this.artifactInfo.outFile),
    );

    if (debug.enabled) {
      debug(`artifactInfo: ${inspect(this.artifactInfo)}`);
      debug(`Copying artifact to: ${dest}`);
    }
    this.fs.copyTpl(
      source,
      dest,
      this.artifactInfo,
      {},
      {globOptions: {dot: true}},
    );
    return;
  }

  async end() {
    this.artifactInfo.type =
      this.artifactInfo.modelNameList &&
      this.artifactInfo.modelNameList.length > 1
        ? 'Repositories'
        : 'Repository';

    this.artifactInfo.name = this.artifactInfo.modelNameList
      ? this.artifactInfo.modelNameList.join()
      : this.artifactInfo.modelName;

    await super.end();
  }
};
