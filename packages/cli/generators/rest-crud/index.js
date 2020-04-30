// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const _ = require('lodash');
const ArtifactGenerator = require('../../lib/artifact-generator');
const fs = require('fs');
const debug = require('../../lib/debug')('rest-crud-generator');
const inspect = require('util').inspect;
const path = require('path');
const chalk = require('chalk');
const utils = require('../../lib/utils');
const g = require('../../lib/globalize');
const cliPkg = require('../../lib/version-helper').cliPkg;

const {updateApplicationTs} = require('./crud-rest-component');

const VALID_CONNECTORS_FOR_REPOSITORY = ['PersistedModel'];

const REST_CONFIG_TEMPLATE = 'model.rest-config-template.ts.ejs';

const PROMPT_MESSAGE_MODEL = g.f(
  'Select the model(s) you want to generate a CRUD REST endpoint',
);
const PROMPT_MESSAGE_DATA_SOURCE = g.f('Please select the datasource');
const PROMPT_MESSAGE_BASE_PATH = g.f('Please specify the base path');

const ERROR_NO_DATA_SOURCES_FOUND = g.f('No datasources found at');
const ERROR_NO_MODELS_FOUND = g.f('No models found at');
const ERROR_NO_MODEL_SELECTED = g.f('You did not select a valid model');

module.exports = class RestCrudGenerator extends ArtifactGenerator {
  // Note: arguments and options should be defined in the constructor.
  constructor(args, opts) {
    super(args, opts);
  }

  /**
   * helper method to inspect and validate a datasource type
   */
  async _inferDataSourceNames() {
    if (!this.artifactInfo.dataSourceClass) {
      return;
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
      type: 'rest-config',
      rootDir: utils.sourceRootDir,
    };

    this.artifactInfo.outDir = path.resolve(
      this.artifactInfo.rootDir,
      utils.modelEndpointsDir,
    );
    this.artifactInfo.datasourcesDir = path.resolve(
      this.artifactInfo.rootDir,
      utils.datasourcesDir,
    );
    this.artifactInfo.modelDir = path.resolve(
      this.artifactInfo.rootDir,
      utils.modelsDir,
    );

    this.artifactInfo.defaultTemplate = REST_CONFIG_TEMPLATE;

    this.option('model', {
      type: String,
      required: false,
      description: g.f('A valid model name'),
    });

    this.option('datasource', {
      type: String,
      required: false,
      description: g.f('A valid datasource name'),
    });

    this.option('basePath', {
      type: String,
      required: false,
      description: g.f('A valid base path'),
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

    await this._inferDataSourceNames();

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
        choices: modelList.map(m => ({name: m, value: m, checked: true})),
        when: this.artifactInfo.modelNameList === undefined,
        // Require at least one model to be selected
        // This prevents users from accidentally pressing ENTER instead of SPACE
        // to select a model from the list
        validate: result => !!result.length,
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

  /**
   * Prompt for basePath if only one model is selected
   */
  async promptBasePath() {
    if (this.options.basePath) {
      this.artifactInfo.basePath = this.options.basePath;
      return;
    }

    if (
      this.artifactInfo.modelNameList &&
      this.artifactInfo.modelNameList.length === 1
    ) {
      const model = this.artifactInfo.modelNameList[0];
      const props = await this.prompt([
        {
          type: 'input',
          name: 'basePath',
          message: PROMPT_MESSAGE_BASE_PATH,
          default: utils.prependBackslash(
            utils.pluralize(utils.urlSlug(model)),
          ),
          validate: utils.validateUrlSlug,
          filter: utils.prependBackslash,
        },
      ]);
      if (props) {
        this.artifactInfo.basePath = props.basePath;
      }
    }
  }

  async scaffold() {
    if (this.shouldExit()) return false;

    if (_.isEmpty(this.artifactInfo.modelNameList)) {
      return this.exit(new Error(`${ERROR_NO_MODEL_SELECTED}`));
    }

    this.artifactInfo.disableIndexUpdate = true;
    for (const model of this.artifactInfo.modelNameList) {
      this.artifactInfo.modelName = model;
      this.artifactInfo.outFile = utils.getRestConfigFileName(model);
      if (
        !this.artifactInfo.basePath ||
        this.artifactInfo.modelNameList.length > 1
      ) {
        const defaultBasePath =
          this.options.basePath ||
          utils.prependBackslash(utils.pluralize(utils.urlSlug(model)));
        this.artifactInfo.basePath = defaultBasePath;
      }

      const source = this.templatePath(
        path.join(
          utils.sourceRootDir,
          utils.modelEndpointsDir,
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
    }

    this.log(
      'Updating src/application.ts to register CrudRestComponent from @loopback/rest-crud',
    );
    await updateApplicationTs(this.destinationPath());
    return;
  }

  install() {
    if (this.shouldExit()) return false;
    debug('install npm dependencies');
    const pkgJson = this.packageJson || {};
    const deps = pkgJson.dependencies || {};
    const pkgs = [];

    const version = cliPkg.config.templateDependencies['@loopback/rest-crud'];

    if (!deps['@loopback/rest-crud']) {
      pkgs.push(`@loopback/rest-crud@${version}`);
    }

    if (pkgs.length === 0) return;

    this.pkgManagerInstall(pkgs, {
      npm: {
        save: true,
      },
    });
  }

  async end() {
    this.artifactInfo.type =
      this.artifactInfo.modelNameList &&
      this.artifactInfo.modelNameList.length > 1
        ? 'RestConfigs'
        : 'RestConfig';

    this.artifactInfo.modelNameList = _.map(
      this.artifactInfo.modelNameList,
      name => {
        return name + '.rest-config';
      },
    );

    this.artifactInfo.name = this.artifactInfo.modelNameList
      ? this.artifactInfo.modelNameList.join(this.classNameSeparator)
      : this.artifactInfo.modelName;

    await super.end();
  }
};
