// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const _ = require('lodash');
const ArtifactGenerator = require('../../lib/artifact-generator');
const debug = require('../../lib/debug')('repository-generator');
const inspect = require('util').inspect;
const path = require('path');
const chalk = require('chalk');
const utils = require('../../lib/utils');
const util = require('util');
const fs = require('fs');
const exists = util.promisify(fs.exists);

const SERVICE_VALUE_CONNECTOR = 'soap,rest';
const KEY_VALUE_CONNECTOR = 'kv-';

const KEY_VALUE_REPOSITORY = 'KeyValueRepository';
const DEFAULT_CRUD_REPOSITORY = 'DefaultCrudRepository';

const REPOSITORY_KV_TEMPLATE = 'repository-kv-template.ts.ejs';
const REPOSITORY_CRUD_TEMPLATE = 'repository-crud-default-template.ts.ejs';

const PROMPT_MESSAGE_MODEL =
  'Select the model you want to generate a repository';
const PROMPT_MESSAGE_DATA_SOURCE = 'Please select the datasource';
const PROMPT_MESSAGE_ID_TYPE = 'What is the type of your ID?';

const ERROR_READING_FILE = 'Error reading file';
const ERROR_NO_DATA_SOURCES_FOUND = 'No datasources found in';
const ERROR_NO_MODELS_FOUND = 'No models found in';

module.exports = class RepositoryGenerator extends ArtifactGenerator {
  // Note: arguments and options should be defined in the constructor.
  constructor(args, opts) {
    super(args, opts);

    /** instance helper method isolated from the execution loop
     * @connectorType: can be a single or a comma separated list
     */
    this.isConnectorType = async function(connectorType, dataSourceClassName) {
      debug(`callling isConnectorType ${connectorType}`);
      let jsonFileContent = '';
      let result = false;

      let datasourceJSONFile = path.join(
        'src',
        'datasources',
        dataSourceClassName
          .replace('Datasource', '.datasource.json')
          .toLowerCase(),
      );

      try {
        const jsonFileExists = await exists(datasourceJSONFile);
        if (jsonFileExists) {
          jsonFileContent = this.fs.readJSON(datasourceJSONFile, {});
        }
      } catch (err) {
        debug(`${ERROR_READING_FILE} ${datasourceJSONFile}: ${err}`);
        return this.exit(err);
      }

      let keyWordsToSearch = connectorType.split(',');
      for (let keyWord of keyWordsToSearch) {
        debug(`asking for keyword ${keyWord}`);
        if (jsonFileContent.connector.includes(keyWord)) {
          result = true;
          break;
        }
      }

      return result;
    };
  }

  _setupGenerator() {
    super._setupGenerator();

    this.artifactInfo = {
      type: 'repository',
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
  }

  setOptions() {
    return super.setOptions();
  }

  checkLoopBackProject() {
    return super.checkLoopBackProject();
  }

  async promptDataSource() {
    debug('Prompting for a datasource ');
    let datasourcesList;

    try {
      datasourcesList = await utils.getArtifactList(
        this.artifactInfo.datasourcesDir,
        'datasource',
        true,
      );
    } catch (err) {
      return this.exit(err);
    }

    // iterate over it to exclude service oriented data sources
    let tempDataSourceList = Object.assign(datasourcesList, {});
    for (let item of tempDataSourceList) {
      let result = await this.isConnectorType(SERVICE_VALUE_CONNECTOR, item);
      debug(`${item} has keyword ${SERVICE_VALUE_CONNECTOR} is ${result}`);
      if (result) {
        // remove from original list
        _.remove(datasourcesList, e => e == item);
      }
    }

    if (_.isEmpty(datasourcesList)) {
      return this.exit(
        `${ERROR_NO_DATA_SOURCES_FOUND} ${this.artifactInfo.datasourcesDir}.
        ${chalk.yellow(
          'Please visit http://loopback.io/doc/en/lb4/Controller-generator.html for information on how repositories are discovered',
        )}`,
      );
    }

    return this.prompt([
      {
        type: 'list',
        name: 'dataSourceClassName',
        message: PROMPT_MESSAGE_DATA_SOURCE,
        choices: datasourcesList,
        when: this.artifactInfo.dataSourceClassName === undefined,
        default: datasourcesList[0],
        validate: utils.validateClassName,
      },
    ])
      .then(props => {
        debug(`props: ${inspect(props)}`);
        Object.assign(this.artifactInfo, props);
        return props;
      })
      .catch(err => {
        debug(`Error during prompt for datasource name: ${err}`);
        return this.exit(err);
      });
  }

  async inferRepositoryType() {
    let result = await this.isConnectorType(
      KEY_VALUE_CONNECTOR,
      this.artifactInfo.dataSourceClassName,
    );

    if (result) {
      this.artifactInfo.repositoryTypeClass = KEY_VALUE_REPOSITORY;
    } else {
      this.artifactInfo.repositoryTypeClass = DEFAULT_CRUD_REPOSITORY;
    }

    // assign the data source name to the information artifact
    let dataSourceName = this.artifactInfo.dataSourceClassName
      .replace('Datasource', '')
      .toLowerCase();

    Object.assign(this.artifactInfo, {dataSourceName: dataSourceName});
    // parent async end() checks for name property, albeit we don't use it here
    Object.assign(this.artifactInfo, {name: dataSourceName});
  }

  async promptModels() {
    let modelList;
    try {
      modelList = await utils.getArtifactList(
        this.artifactInfo.modelDir,
        'model',
      );
    } catch (err) {
      return this.exit(err);
    }

    if (_.isEmpty(modelList)) {
      return this.exit(
        `${ERROR_NO_MODELS_FOUND} ${this.artifactInfo.modelDir}.
        ${chalk.yellow(
          'Please visit http://loopback.io/doc/en/lb4/Repository-generator.html for information on how models are discovered',
        )}`,
      );
    }

    return this.prompt([
      {
        type: 'list',
        name: 'modelName',
        message: PROMPT_MESSAGE_MODEL,
        choices: modelList,
        when: this.artifactInfo.modelName === undefined,
        default: modelList[0],
        validate: utils.validateClassName,
      },
      {
        type: 'list',
        name: 'idType',
        message: PROMPT_MESSAGE_ID_TYPE,
        choices: ['number', 'string', 'object'],
        when: this.artifactInfo.idType === undefined,
        default: 'number',
      },
    ])
      .then(props => {
        debug(`props: ${inspect(props)}`);
        Object.assign(this.artifactInfo, props);
        return props;
      })
      .catch(err => {
        debug(`Error during prompt for repository variables: ${err}`);
        return this.exit(err);
      });
  }

  scaffold() {
    // We don't want to call the base scaffold function since it copies
    // all of the templates!
    if (this.shouldExit()) return false;

    this.artifactInfo.className = utils.toClassName(this.artifactInfo.name);

    this.artifactInfo.outFile =
      utils.kebabCase(this.artifactInfo.modelName) + '.repository.ts';
    if (debug.enabled) {
      debug(`Artifact output filename set to: ${this.artifactInfo.outFile}`);
    }

    let template = '';

    /* place a switch statement for future repository types */
    switch (this.artifactInfo.repositoryTypeClass) {
      case KEY_VALUE_REPOSITORY:
        template = REPOSITORY_KV_TEMPLATE;
        break;
      default:
        template = REPOSITORY_CRUD_TEMPLATE;
    }

    const source = this.templatePath(
      path.join('src', 'repositories', template),
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
    await super.end();
  }
};
