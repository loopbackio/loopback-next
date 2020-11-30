// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const path = require('path');
const ArtifactGenerator = require('../../lib/artifact-generator');
const modelMaker = require('../../lib/model-discoverer');
const debug = require('../../lib/debug')('discover-generator');
const chalk = require('chalk');
const utils = require('../../lib/utils');
const modelDiscoverer = require('../../lib/model-discoverer');
const {importDiscoveredModel} = require('./import-discovered-model');
const g = require('../../lib/globalize');

const rootDir = 'src';

module.exports = class DiscoveryGenerator extends ArtifactGenerator {
  constructor(args, opts) {
    super(args, opts);

    this.option('dataSource', {
      type: String,
      alias: 'ds',
      description: g.f('The name of the datasource to discover'),
    });

    this.option('views', {
      type: Boolean,
      description: g.f('Boolean to discover views'),
      default: true,
    });

    this.option('schema', {
      type: String,
      description: g.f('Schema to discover'),
      default: '',
    });

    this.option('all', {
      type: Boolean,
      description: g.f('Discover all models without prompting users to select'),
      default: false,
    });

    this.option('outDir', {
      type: String,
      description: g.f(
        'Specify the directory into which the `model.model.ts` files will be placed',
      ),
      default: undefined,
    });
  }

  _setupGenerator() {
    this.artifactInfo = {
      type: 'discover',
      rootDir,
      outDir: path.resolve(rootDir, 'models'),
    };

    return super._setupGenerator();
  }

  /**
   * If we have a dataSource, attempt to load it
   * @returns {*}
   */
  setOptions() {
    /* istanbul ignore next */
    if (this.options.dataSource) {
      debug(`Data source specified: ${this.options.dataSource}`);
      this.artifactInfo.dataSource = modelMaker.loadDataSourceByName(
        this.options.dataSource,
      );
    }

    return super.setOptions();
  }

  /**
   * Ensure CLI is being run in a LoopBack 4 project.
   */
  checkLoopBackProject() {
    /* istanbul ignore next */
    if (this.shouldExit()) return;
    return super.checkLoopBackProject();
  }

  /**
   * Loads all datasources to choose if the dataSource option isn't set
   */
  async loadAllDatasources() {
    // If we have a dataSourcePath then it is already loaded for us, we don't need load any
    /* istanbul ignore next */
    if (this.artifactInfo.dataSource) {
      return;
    }
    const dsDir = modelMaker.DEFAULT_DATASOURCE_DIRECTORY;
    const datasourcesList = await utils.getArtifactList(
      dsDir,
      'datasource',
      false,
    );
    debug(datasourcesList);

    this.dataSourceChoices = datasourcesList.map(s =>
      modelDiscoverer.loadDataSource(
        path.resolve(dsDir, `${utils.toFileName(s)}.datasource.js`),
      ),
    );
    debug(`Done importing datasources`);
  }

  /**
   * Ask the user to select the data source from which to discover
   */
  promptDataSource() {
    /* istanbul ignore next */
    if (this.shouldExit()) return;
    const prompts = [
      {
        name: 'dataSource',
        message: g.f('Select the connector to discover'),
        type: 'list',
        choices: this.dataSourceChoices,
        when:
          this.artifactInfo.dataSource === undefined &&
          !this.artifactInfo.modelDefinitions,
      },
    ];

    return this.prompt(prompts).then(answer => {
      /* istanbul ignore next */
      if (!answer.dataSource) return;
      debug(`Datasource answer: ${JSON.stringify(answer)}`);

      this.artifactInfo.dataSource = this.dataSourceChoices.find(
        d => d.name === answer.dataSource,
      );
    });
  }

  /**
   * Puts all discoverable models in this.modelChoices
   */
  async discoverModelInfos() {
    /* istanbul ignore if */
    if (this.artifactInfo.modelDefinitions) return;
    debug(`Getting all models from ${this.artifactInfo.dataSource.name}`);

    this.modelChoices = await modelMaker.discoverModelNames(
      this.artifactInfo.dataSource,
      {
        views: this.options.views,
        schema: this.options.schema,
      },
    );
    debug(
      `Got ${this.modelChoices.length} models from ${this.artifactInfo.dataSource.name}`,
    );
  }

  /**
   * Now that we have a list of all models for a datasource,
   * ask which models to discover
   */
  promptModelChoices() {
    // If we are discovering all we don't need to prompt
    /* istanbul ignore next */
    if (this.options.all) {
      this.discoveringModels = this.modelChoices;
    }

    const prompts = [
      {
        name: 'discoveringModels',
        message: g.f('Select the models which to discover'),
        type: 'checkbox',
        choices: this.modelChoices,
        when:
          this.discoveringModels === undefined &&
          !this.artifactInfo.modelDefinitions,
        // Require at least one model to be selected
        // This prevents users from accidentally pressing ENTER instead of SPACE
        // to select a model from the list
        validate: result => !!result.length,
      },
    ];

    return this.prompt(prompts).then(answers => {
      /* istanbul ignore next */
      if (!answers.discoveringModels) return;
      debug(`Models chosen: ${JSON.stringify(answers)}`);
      this.discoveringModels = [];
      answers.discoveringModels.forEach(m => {
        this.discoveringModels.push(this.modelChoices.find(c => c.name === m));
      });
    });
  }

  /**
   * Prompts what naming convention they would like to have for column names.
   */
  promptColNamingConvention() {
    this.namingConvention = [
      {
        name: g.f('Camel case (exampleColumn) (Recommended)'),
        value: 'camelCase',
      },
      {
        name: g.f('No conversion (EXAMPLE_COLUMN)'),
        value: 'noCase',
      },
    ];
    return this.prompt([
      {
        name: 'disableCamelCase',
        message: g.f(
          'Select a convention to convert db column names(EXAMPLE_COLUMN) to model property names:',
        ),
        type: 'list',
        choices: this.namingConvention,
        default: false,
      },
    ]).then(props => {
      /* istanbul ignore next */
      if (!props.disableCamelCase) return;
      props.disableCamelCase = props.disableCamelCase !== 'camelCase';

      Object.assign(this.artifactInfo, props);
      /* istanbul ignore next */
      if (props.disableCamelCase) {
        this.log(
          chalk.red(
            g.f(
              'By disabling Camel case, you might need to specify these customized names in relation definition.',
            ),
          ),
        );
      }
      debug(`props after naming convention prompt: ${props.disableCamelCase}`);
      return props;
    });
  }

  /**
   * Using artifactInfo.dataSource,
   * artifactInfo.modelNameOptions
   *
   * this will discover every model
   * and put it in artifactInfo.modelDefinitions
   * @returns {Promise<void>}
   */
  async getAllModelDefs() {
    /* istanbul ignore next */
    if (this.shouldExit()) {
      await this.artifactInfo.dataSource.disconnect();
      return false;
    }
    this.artifactInfo.modelDefinitions = [];
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < this.discoveringModels.length; i++) {
      const modelInfo = this.discoveringModels[i];
      debug(`Discovering: ${modelInfo.name}...`);
      this.artifactInfo.modelDefinitions.push(
        await modelMaker.discoverSingleModel(
          this.artifactInfo.dataSource,
          modelInfo.name,
          {
            schema: modelInfo.owner,
            disableCamelCase: this.artifactInfo.disableCamelCase,
          },
        ),
      );
      debug(`Discovered: ${modelInfo.name}`);
    }
  }

  /**
   * Iterate through all the models we have discovered and scaffold
   */
  async scaffold() {
    // Exit if needed
    /* istanbul ignore next */
    if (this.shouldExit()) {
      await this.artifactInfo.dataSource.disconnect();
      return;
    }
    this.artifactInfo.indexesToBeUpdated =
      this.artifactInfo.indexesToBeUpdated || [];

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < this.artifactInfo.modelDefinitions.length; i++) {
      const modelDefinition = this.artifactInfo.modelDefinitions[i];
      const templateData = importDiscoveredModel(modelDefinition);

      debug(
        'Generating model %s from template data',
        modelDefinition.name,
        templateData,
      );

      const fullPath = path.resolve(
        this.options.outDir || this.artifactInfo.outDir,
        utils.getModelFileName(modelDefinition.name),
      );
      debug(`Writing: ${fullPath}`);

      this.copyTemplatedFiles(
        modelDiscoverer.MODEL_TEMPLATE_PATH,
        fullPath,
        templateData,
      );

      this.artifactInfo.indexesToBeUpdated.push({
        dir: this.options.outDir || this.artifactInfo.outDir,
        file: utils.getModelFileName(modelDefinition.name),
      });

      await this.artifactInfo.dataSource.disconnect();
    }

    // This part at the end is just for the ArtifactGenerator
    // end message to output something nice, before it was "Discover undefined was created in src/models/"
    this.artifactInfo.type = 'Models';
    this.artifactInfo.name = this.artifactInfo.modelDefinitions
      .map(d => d.name)
      .join(',');
  }

  async end() {
    await super.end();
  }
};
