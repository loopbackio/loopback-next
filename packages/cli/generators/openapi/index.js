// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const BaseGenerator = require('../../lib/base-generator');
const {debug, debugJson, validateUrlOrFile, escapeComment} = require('./utils');
const {loadAndBuildSpec} = require('./spec-loader');
const utils = require('../../lib/utils');
const {parse} = require('url');
const path = require('path');
const semver = require('semver');
const slash = require('slash');
const {getControllerFileName, getServiceFileName} = require('./spec-helper');

const updateIndex = require('../../lib/update-index');
const MODEL = 'models';
const CONTROLLER = 'controllers';
const DATASOURCE = 'datasources';
const SERVICE = 'services';
const g = require('../../lib/globalize');
const json5 = require('json5');

const isWindows = process.platform === 'win32';

module.exports = class OpenApiGenerator extends BaseGenerator {
  // Note: arguments and options should be defined in the constructor.
  constructor(args, opts) {
    super(args, opts);
  }

  _setupGenerator() {
    this.argument('url', {
      description: g.f('URL or file path of the OpenAPI spec'),
      required: false,
      type: String,
    });

    this.option('url', {
      description: g.f('URL or file path of the OpenAPI spec'),
      required: false,
      type: String,
    });

    this.option('validate', {
      description: g.f('Validate the OpenAPI spec'),
      required: false,
      default: false,
      type: Boolean,
    });

    this.option('server', {
      description: g.f('Generate server-side controllers for the OpenAPI spec'),
      required: false,
      default: true,
      type: Boolean,
    });

    this.option('client', {
      description: g.f(
        'Generate client-side service proxies for the OpenAPI spec',
      ),
      required: false,
      default: false,
      type: Boolean,
    });

    this.option('datasource', {
      type: String,
      required: false,
      description: g.f('A valid datasource name for the OpenAPI endpoint'),
    });

    this.option('baseModel', {
      description: g.f('Base model class'),
      required: false,
      default: '',
      type: String,
    });

    this.option('promote-anonymous-schemas', {
      description: g.f('Promote anonymous schemas as models'),
      required: false,
      default: false,
      type: Boolean,
    });

    return super._setupGenerator();
  }

  checkLoopBackProject() {
    return super.checkLoopBackProject();
  }

  async promptDataSourceName() {
    if (this.shouldExit()) return false;
    if (
      this.options.baseModel &&
      this.options.baseModel !== 'Model' &&
      this.options.baseModel !== 'Entity'
    ) {
      this.exit(
        `Invalid baseModel: ${this.options.baseModel}. Valid values: Model, Entity.`,
      );
      return;
    }
    if (this.options.client !== true) return;
    if (this.options.url) return;

    debug('Prompting for a datasource');

    // grab the datasource from the command line
    const dsClass = this.options.datasource
      ? utils.toClassName(this.options.datasource) + 'DataSource'
      : '';

    debug(`command line datasource is ${dsClass}`);

    const dataSourcesDir = this.destinationPath(
      `${utils.sourceRootDir}/${utils.datasourcesDir}`,
    );

    const dataSourceClasses = await utils.getArtifactList(
      dataSourcesDir,
      'datasource',
      true,
    );

    // List all data sources
    const dataSourceList = dataSourceClasses.map(ds => ({
      className: ds,
    }));
    debug('datasourceList from %s', dataSourcesDir, dataSourceList);

    // Find openapi data sources
    const openApiDataSources = dataSourceList.filter(ds => {
      debug(`data source inspecting item: ${ds.className}`);
      const dsObj = utils.getDataSourceConfig(dataSourcesDir, ds.className);

      if (
        dsObj.connector === 'openapi' ||
        dsObj.connector === 'loopback-connector-openapi'
      ) {
        ds.usePositionalParams = dsObj.positional;
        ds.name = dsObj.name;
        ds.className = utils.toClassName(dsObj.name) + 'DataSource';
        ds.specPath = dsObj.spec;
        return true;
      }
    });

    debug('Data sources using openapi connector', openApiDataSources);

    if (openApiDataSources.length === 0) {
      return;
    }

    const matchedDs = openApiDataSources.find(ds => ds.className === dsClass);
    if (matchedDs) {
      this.dataSourceInfo = {
        name: matchedDs.name,
        className: matchedDs.className,
        usePositionalParams: matchedDs.usePositionalParams,
        specPath: matchedDs.specPath,
      };
      this.log(
        g.f('Datasource %s - %s found for OpenAPI: %s'),
        this.options.datasource,
        this.dataSourceInfo.className,
        this.dataSourceInfo.specPath,
      );
      return;
    }

    if (dsClass) return;

    const answers = await this.prompt([
      {
        type: 'list',
        name: 'dataSource',
        message: g.f('Please select the datasource'),
        choices: openApiDataSources.map(ds => ({
          name: `${ds.name} - ${ds.className}`,
          value: ds,
        })),
        default: `${openApiDataSources[0].name} - ${openApiDataSources[0].className}`,
        validate: utils.validateClassName,
      },
    ]);

    debug('Datasource selected', answers);
    if (answers && answers.dataSource) {
      this.dataSourceInfo = {
        name: answers.dataSource.name,
        className: answers.dataSource.className,
        usePositionalParams: answers.dataSource.usePositionalParams,
        specPath: answers.dataSource.specPath,
      };
      this.log(
        g.f('Datasource %s - %s selected: %s'),
        this.dataSourceInfo.name,
        this.dataSourceInfo.className,
        this.dataSourceInfo.specPath,
      );
    }
  }

  async askForSpecUrlOrPath() {
    if (this.shouldExit()) return;
    if (this.dataSourceInfo && this.dataSourceInfo.specPath) {
      this.url = this.dataSourceInfo.specPath;
      return;
    }
    const prompts = [
      {
        name: 'url',
        message: g.f('Enter the OpenAPI spec url or file path:'),
        default: this.options.url,
        validate: validateUrlOrFile,
        when: this.options.url == null,
      },
    ];
    const answers = await this.prompt(prompts);
    if (answers.url) {
      this.url = answers.url.trim();
    } else {
      this.url = this.options.url;
    }
  }

  async loadAndBuildApiSpec() {
    if (this.shouldExit()) return;
    try {
      const result = await loadAndBuildSpec(this.url, {
        log: this.log,
        validate: this.options.validate,
        promoteAnonymousSchemas: this.options['promote-anonymous-schemas'],
      });
      debugJson('OpenAPI spec', result.apiSpec);
      Object.assign(this, result);
    } catch (e) {
      this.exit(e);
    }
  }

  async selectControllers() {
    if (this.shouldExit()) return;
    const choices = this.controllerSpecs.map(c => {
      const names = [];
      if (this.options.server !== false) {
        names.push(c.className);
      }
      if (this.options.client === true) {
        names.push(c.serviceClassName);
      }
      const name = c.tag ? `[${c.tag}] ${names.join(' ')}` : names.join(' ');
      return {
        name,
        value: c.className,
        checked: true,
      };
    });
    const prompts = [
      {
        name: 'controllerSelections',
        message: g.f(
          'Select controllers and/or service proxies to be generated:',
        ),
        type: 'checkbox',
        choices: choices,
        // Require at least one item to be selected
        // This prevents users from accidentally pressing ENTER instead of SPACE
        // to select an item from the list
        validate: result => !!result.length,
      },
    ];
    const selections =
      (await this.prompt(prompts)).controllerSelections ||
      choices.map(c => c.value);
    this.selectedControllers = this.controllerSpecs.filter(c =>
      selections.some(a => a === c.className),
    );
    this.selectedServices = this.selectedControllers;
    this.selectedControllers.forEach(c => {
      c.fileName = getControllerFileName(c.tag || c.className);
      c.serviceFileName = getServiceFileName(c.tag || c.serviceClassName);
    });
  }

  _generateControllers() {
    const source = this.templatePath(
      'src/controllers/controller-template.ts.ejs',
    );
    for (const c of this.selectedControllers) {
      const controllerFile = c.fileName;
      if (debug.enabled) {
        debug(`Artifact output filename set to: ${controllerFile}`);
      }
      const dest = this.destinationPath(`src/controllers/${controllerFile}`);
      if (debug.enabled) {
        debug('Copying artifact to: %s', dest);
      }
      this.copyTemplatedFiles(source, dest, mixinEscapeComment(c));
    }
  }

  async _generateDataSource() {
    let specPath = this.url;
    const parsed = parse(this.url);
    if (
      // Relative paths and UNIX paths don't have any protocol set
      parsed.protocol == null ||
      // Support absolute Windows paths, e.g. "C:\some\dir\api.yaml"
      // When such path is parsed as a URL, we end up with the drive ("C:")
      // recognized as the protocol.
      (isWindows && parsed.protocol.match(/^[a-zA-Z]:$/))
    ) {
      specPath = path.relative(this.destinationRoot(), this.url);
      if (isWindows && !path.parse(specPath).root) {
        // On Windows, convert the relative path to use Unix-style separator
        // We need this behavior for our snapshot-based tests, but @bajtos
        // thinks it is also nicer for users - at the end of the day,
        // this is a spec URL and URLs always use forward-slash characters
        specPath = slash(specPath);
      }
    }
    this.dataSourceInfo.specPath = specPath;
    const dsConfig = {
      name: this.dataSourceInfo.name,
      connector: 'openapi',
      spec: this.dataSourceInfo.specPath,
      validate: false,
      positional:
        this.dataSourceInfo.usePositionalParams !== false ? 'bodyLast' : false,
    };

    this.dataSourceInfo.dsConfigString = json5.stringify(dsConfig, null, 2);

    const classTemplatePath = this.templatePath(
      'src/datasources/datasource.ts.ejs',
    );
    const dataSourceFile = this.dataSourceInfo.outFile;
    if (debug.enabled) {
      debug(`Artifact output filename set to: ${dataSourceFile}`);
    }
    const dest = this.destinationPath(`src/datasources/${dataSourceFile}`);
    if (debug.enabled) {
      debug('Copying artifact to: %s', dest);
    }
    const context = {...this.dataSourceInfo};
    let dsClass = context.className;
    dsClass = dsClass.endsWith('DataSource')
      ? dsClass.substring(0, dsClass.length - 'DataSource'.length)
      : dsClass;
    context.className = dsClass;
    this.copyTemplatedFiles(classTemplatePath, dest, context);
    this.dataSources = [{fileName: dataSourceFile}];
  }

  _generateServiceProxies() {
    const source = this.templatePath(
      'src/services/service-proxy-template.ts.ejs',
    );
    for (const c of this.selectedControllers) {
      const file = c.serviceFileName;
      if (debug.enabled) {
        debug(`Artifact output filename set to: ${file}`);
      }
      const dest = this.destinationPath(`src/services/${file}`);
      if (debug.enabled) {
        debug('Copying artifact to: %s', dest);
      }
      const context = {
        ...mixinEscapeComment(c),
        usePositionalParams: this.dataSourceInfo.usePositionalParams,
        dataSourceName: this.dataSourceInfo.name,
        dataSourceClassName: this.dataSourceInfo.className,
      };
      this.copyTemplatedFiles(source, dest, context);
    }
  }

  _generateModels() {
    const modelSource = this.templatePath('src/models/model-template.ts.ejs');
    const typeSource = this.templatePath('src/models/type-template.ts.ejs');
    for (const m of this.modelSpecs) {
      if (!m.fileName) continue;
      m.baseModel = this.options.baseModel;
      const modelFile = m.fileName;
      if (debug.enabled) {
        debug(`Artifact output filename set to: ${modelFile}`);
      }
      const dest = this.destinationPath(`src/models/${modelFile}`);
      if (debug.enabled) {
        debug('Copying artifact to: %s', dest);
      }
      const source = m.kind === 'class' ? modelSource : typeSource;
      this.copyTemplatedFiles(source, dest, mixinEscapeComment(m));
    }
  }

  // update index file for models and controllers
  async _updateIndex(dir) {
    const update = async files => {
      const targetDir = this.destinationPath(`src/${dir}`);
      for (const f of files) {
        // Check all files being generated to ensure they succeeded
        const status = this.conflicter.generationStatus[f];
        if (status !== 'skip' && status !== 'identical') {
          await updateIndex(targetDir, f, this.fs);
        }
      }
    };
    let files = undefined;
    switch (dir) {
      case MODEL:
        files = this.modelSpecs.map(m => m.fileName);
        break;
      case CONTROLLER:
        files = this.selectedControllers.map(m => m.fileName);
        break;
      case SERVICE:
        files = this.selectedServices.map(m => m.serviceFileName);
        break;
      case DATASOURCE:
        files = this.dataSources.map(m => m.fileName);
        break;
    }

    if (files != null) {
      await update(files);
    }
  }

  async promptNewDataSourceName() {
    if (this.shouldExit()) return false;
    if (this.options.client !== true) return;
    // skip if the data source already exists
    if (this.dataSourceInfo && this.dataSourceInfo.name) return;

    this.dataSourceInfo = {
      name: this.options.datasource || 'openapi',
      usePositionalParams: this.options.positional !== false,
    };

    debug('Prompting for artifact name');
    const prompts = [
      {
        type: 'input',
        name: 'dataSourceName',
        // capitalization
        message: g.f('DataSource name:'),
        default: 'openapi',
        validate: utils.validateClassName,
        when: !this.options.datasource,
      },
    ];

    const answers = await this.prompt(prompts);
    if (answers != null && answers.dataSourceName) {
      this.dataSourceInfo.name = answers.dataSourceName;
    }

    // Setting up data for templates
    this.dataSourceInfo.className =
      utils.toClassName(this.dataSourceInfo.name) + 'DataSource';
    this.dataSourceInfo.fileName = utils.toFileName(this.dataSourceInfo.name);
    this.dataSourceInfo.outFile = `${this.dataSourceInfo.fileName}.datasource.ts`;
  }

  async scaffold() {
    if (this.shouldExit()) return false;
    this._generateModels();
    await this._updateIndex(MODEL);
    if (this.options.server !== false) {
      this._generateControllers();
      await this._updateIndex(CONTROLLER);
    }
    if (this.options.client === true) {
      if (this.dataSourceInfo.outFile) {
        await this._generateDataSource();
        await this._updateIndex(DATASOURCE);
      }
      this._generateServiceProxies();
      await this._updateIndex(SERVICE);
    }
  }

  install() {
    if (this.shouldExit()) return false;
    debug('install npm dependencies');
    const pkgJson = this.packageJson || {};
    const deps = pkgJson.dependencies || {};
    const pkgs = [];
    const connectorVersionRange = deps['loopback-connector-openapi'];
    if (!connectorVersionRange) {
      // No dependency found for loopback-connector-openapi
      pkgs.push('loopback-connector-openapi');
    } else {
      // `loopback-connector-openapi` exists - make sure its version range
      // is >= 6.0.0
      try {
        const minVersion = semver.minVersion(connectorVersionRange);
        if (semver.lt(minVersion, '6.0.0')) {
          pkgs.push('loopback-connector-openapi@^6.0.0');
        }
      } catch (err) {
        // The version can be a tarball
        this.log(err);
      }
    }

    if (pkgs.length === 0) return;

    this.pkgManagerInstall(pkgs, {
      npm: {
        save: true,
      },
    });
  }

  async end() {
    await super.end();
    if (this.shouldExit()) return;
  }
};

function mixinEscapeComment(context) {
  return Object.assign(context, {escapeComment});
}
