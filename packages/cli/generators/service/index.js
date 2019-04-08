// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const _ = require('lodash');
const ArtifactGenerator = require('../../lib/artifact-generator');
const fs = require('fs');
const debug = require('../../lib/debug')('service-generator');
const inspect = require('util').inspect;
const path = require('path');
const chalk = require('chalk');
const utils = require('../../lib/utils');

const VALID_CONNECTORS_FOR_SERVICE = ['Model'];

const SERVICE_TEMPLATE = 'service-template.ts.ejs';

const PROMPT_MESSAGE_DATA_SOURCE = 'Please select the datasource';

const ERROR_NO_DATA_SOURCES_FOUND = 'No datasources found at';

module.exports = class ServiceGenerator extends ArtifactGenerator {
  // Note: arguments and options should be defined in the constructor.
  constructor(args, opts) {
    super(args, opts);
  }

  _setupGenerator() {
    this.artifactInfo = {
      type: 'service',
      rootDir: utils.sourceRootDir,
    };

    this.artifactInfo.outDir = path.resolve(
      this.artifactInfo.rootDir,
      utils.servicesDir,
    );

    this.artifactInfo.datasourcesDir = path.resolve(
      this.artifactInfo.rootDir,
      utils.datasourcesDir,
    );

    this.artifactInfo.defaultTemplate = SERVICE_TEMPLATE;

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

  checkLoopBackProject() {
    if (this.shouldExit()) return;
    return super.checkLoopBackProject();
  }

  async checkPaths() {
    if (this.shouldExit()) return;
    // check for datasources
    if (!fs.existsSync(this.artifactInfo.datasourcesDir)) {
      new Error(
        `${ERROR_NO_DATA_SOURCES_FOUND} ${
          this.artifactInfo.datasourcesDir
        }. ${chalk.yellow(
          'Please visit https://loopback.io/doc/en/lb4/DataSource-generator.html for information on how datasources are discovered',
        )}`,
      );
    }
  }

  async promptDataSourceName() {
    debug('Prompting for a datasource ');
    if (this.shouldExit()) return;
    let cmdDatasourceName;
    let datasourcesList;

    // grab the datasource name from the command line
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
      debug(
        `datasourcesList from ${utils.sourceRootDir}/${
          utils.datasourcesDir
        } : ${datasourcesList}`,
      );
    } catch (err) {
      return this.exit(err);
    }

    const availableDatasources = datasourcesList.filter(item => {
      debug(
        `inspecting datasource: ${item} for basemodel: ${VALID_CONNECTORS_FOR_SERVICE}`,
      );
      const result = utils.isConnectorOfType(
        VALID_CONNECTORS_FOR_SERVICE,
        this.artifactInfo.datasourcesDir,
        item,
      );
      return result;
    });

    if (availableDatasources.length === 0) {
      return this.exit(
        new Error(
          `${ERROR_NO_DATA_SOURCES_FOUND} ${
            this.artifactInfo.datasourcesDir
          }. ${chalk.yellow(
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

    debug(`artifactInfo.dataSourceClass ${this.artifactInfo.dataSourceClass}`);

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

  /**
   * Ask for Service Name
   */
  async promptArtifactName() {
    debug('Prompting for service name');
    if (this.shouldExit()) return;

    if (this.options.name) {
      Object.assign(this.artifactInfo, {name: this.options.name});
    }

    const prompts = [
      {
        type: 'input',
        name: 'name',
        // capitalization
        message: utils.toClassName(this.artifactInfo.type) + ' name:',
        when: !this.artifactInfo.name,
        validate: utils.validateClassName,
      },
    ];
    return this.prompt(prompts).then(props => {
      Object.assign(this.artifactInfo, props);
      return props;
    });
  }

  /**
   * this method will be in charge of inferring and create
   * the remote interfaces from either SOAP wsdl or REST openApi json
   *
   * TODO: add functionality to inspect service specs to generate
   * strongly-typed service proxies and corresponding model definitions.
   */
  async inferInterfaces() {
    if (this.shouldExit()) return;
    let connectorType = utils.getDataSourceConnectorName(
      this.artifactInfo.datasourcesDir,
      this.artifactInfo.dataSourceClass,
    );

    // connectorType should output soap or rest in this case
    // The base an further work for inferring remote methods
    debug(`connectorType: ${connectorType}`);
  }

  scaffold() {
    if (this.shouldExit()) return false;

    this.artifactInfo.dataSourceName = utils.getDataSourceName(
      this.artifactInfo.datasourcesDir,
      this.artifactInfo.dataSourceClass,
    );

    this.artifactInfo.dataSourceClassName =
      utils.toClassName(this.artifactInfo.dataSourceName) + 'DataSource';

    // Setting up data for templates
    this.artifactInfo.className = utils.toClassName(this.artifactInfo.name);
    this.artifactInfo.fileName = utils.kebabCase(this.artifactInfo.name);

    Object.assign(this.artifactInfo, {
      outFile: utils.getServiceFileName(this.artifactInfo.name),
    });

    const source = this.templatePath(this.artifactInfo.defaultTemplate);

    const dest = this.destinationPath(
      path.join(this.artifactInfo.outDir, this.artifactInfo.outFile),
    );

    debug(`artifactInfo: ${inspect(this.artifactInfo)}`);
    debug(`Copying artifact to: ${dest}`);

    this.copyTemplatedFiles(source, dest, this.artifactInfo);
    return;
  }

  install() {
    if (this.shouldExit()) return false;
    debug('install npm dependencies');
    const pkgJson = this.packageJson || {};
    const deps = pkgJson.dependencies || {};
    const pkgs = [];

    if (!deps['@loopback/service-proxy']) {
      pkgs.push('@loopback/service-proxy');
    }
    if (pkgs.length) this.npmInstall(pkgs, {save: true});
  }

  async end() {
    await super.end();
  }
};
