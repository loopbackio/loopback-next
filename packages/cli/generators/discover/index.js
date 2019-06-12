const path = require('path');
const ArtifactGenerator = require('../../lib/artifact-generator');
const modelMaker = require('../../lib/model-discoverer');
const debug = require('../../lib/debug')('discover-generator');
const utils = require('../../lib/utils');
const modelDiscoverer = require('../../lib/model-discoverer');
const rootDir = 'src';

module.exports = class DiscoveryGenerator extends ArtifactGenerator {
  constructor(args, opts) {
    super(args, opts);

    this.option('dataSource', {
      type: String,
      alias: 'ds',
      description: 'The name of the datasource to discover',
    });

    this.option('views', {
      type: Boolean,
      description: 'Boolean to discover views',
      default: true,
    });

    this.option('schema', {
      type: String,
      description: 'Schema to discover',
      default: '',
    });

    this.option('all', {
      type: Boolean,
      description: 'Discover all models without prompting users to select',
      default: false,
    });

    this.option('outDir', {
      type: String,
      description:
        'Specify the directory into which the `model.model.ts` files will be placed',
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
    if (this.shouldExit()) return;
    return super.checkLoopBackProject();
  }

  /**
   * Loads all datasources to choose if the dataSource option isn't set
   */
  async loadAllDatasources() {
    // If we have a dataSourcePath then it is already loaded for us, we don't need load any
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
    if (this.shouldExit()) return;
    const prompts = [
      {
        name: 'dataSource',
        message: `Select the connector to discover`,
        type: 'list',
        choices: this.dataSourceChoices,
        when:
          this.artifactInfo.dataSource === undefined &&
          !this.artifactInfo.modelDefinitions,
      },
    ];

    return this.prompt(prompts).then(answer => {
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
    if (this.artifactInfo.modelDefinitions) return;
    debug(`Getting all models from ${this.artifactInfo.dataSource.name}`);

    this.modelChoices = await modelMaker.discoverModelNames(
      this.artifactInfo.dataSource,
      {views: this.options.views, schema: this.options.schema},
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
    if (this.options.all) {
      this.discoveringModels = this.modelChoices;
    }

    const prompts = [
      {
        name: 'discoveringModels',
        message: `Select the models which to discover`,
        type: 'checkbox',
        choices: this.modelChoices,
        when:
          this.discoveringModels === undefined &&
          !this.artifactInfo.modelDefinitions,
      },
    ];

    return this.prompt(prompts).then(answers => {
      if (!answers.discoveringModels) return;
      debug(`Models chosen: ${JSON.stringify(answers)}`);
      this.discoveringModels = [];
      answers.discoveringModels.forEach(m => {
        this.discoveringModels.push(this.modelChoices.find(c => c.name === m));
      });
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
    this.artifactInfo.modelDefinitions = [];
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < this.discoveringModels.length; i++) {
      const modelInfo = this.discoveringModels[i];
      debug(`Discovering: ${modelInfo.name}...`);
      this.artifactInfo.modelDefinitions.push(
        await modelMaker.discoverSingleModel(
          this.artifactInfo.dataSource,
          modelInfo.name,
          {schema: modelInfo.owner},
        ),
      );
      debug(`Discovered: ${modelInfo.name}`);
    }
  }

  /**
   * Iterate through all the models we have discovered and scaffold
   */
  async scaffold() {
    this.artifactInfo.indexesToBeUpdated =
      this.artifactInfo.indexesToBeUpdated || [];

    // Exit if needed
    if (this.shouldExit()) return false;

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < this.artifactInfo.modelDefinitions.length; i++) {
      const modelDefinition = this.artifactInfo.modelDefinitions[i];
      Object.entries(modelDefinition.properties).forEach(([k, v]) =>
        modelDiscoverer.sanitizeProperty(v),
      );
      modelDefinition.isModelBaseBuiltin = true;
      modelDefinition.modelBaseClass = 'Entity';
      modelDefinition.className = utils.pascalCase(modelDefinition.name);
      // These last two are so that the template doesn't error out if they aren't there
      modelDefinition.allowAdditionalProperties = true;
      // modelDefinition.modelSettings = modelDefinition.settings || {};
      modelDefinition.modelSettings = utils.stringifyModelSettings(
        modelDefinition.settings || {},
      );
      debug(`Generating: ${modelDefinition.name}`);

      const fullPath = path.resolve(
        this.options.outDir || this.artifactInfo.outDir,
        utils.getModelFileName(modelDefinition.name),
      );
      debug(`Writing: ${fullPath}`);

      this.copyTemplatedFiles(
        modelDiscoverer.MODEL_TEMPLATE_PATH,
        fullPath,
        modelDefinition,
      );

      this.artifactInfo.indexesToBeUpdated.push({
        dir: this.options.outDir || this.artifactInfo.outDir,
        file: utils.getModelFileName(modelDefinition.name),
      });

      await this.artifactInfo.dataSource.disconnect();
    }

    // This part at the end is just for the ArtifactGenerator
    // end message to output something nice, before it was "Discover undefined was created in src/models/"
    this.artifactInfo.name = this.artifactInfo.modelDefinitions
      .map(d => utils.getModelFileName(d.name))
      .join(',');
  }

  async end() {
    await super.end();
  }
};
