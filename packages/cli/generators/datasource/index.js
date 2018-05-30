// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const ArtifactGenerator = require('../../lib/artifact-generator');
const debug = require('../../lib/debug')('datasource-generator');
const chalk = require('chalk');
const path = require('path');
const utils = require('../../lib/utils');
const connectors = require('./connectors.json');

/**
 * DataSource Generator -- CLI
 *
 * Prompts for a name, connector and connector options. Creates json file
 * for the DataSource as well as a Class for a user to modify. Also installs the
 * appropriate connector from npm.
 */
module.exports = class DataSourceGenerator extends ArtifactGenerator {
  constructor(args, opts) {
    super(args, opts);
  }

  _setupGenerator() {
    this.artifactInfo = {
      type: 'datasource',
      rootDir: 'src',
    };

    // Datasources are stored in the datasources directory
    this.artifactInfo.outDir = path.resolve(
      this.artifactInfo.rootDir,
      'datasources',
    );

    const connectorChoices = [];
    /**
     * Creating a list of connectors -- and marking them as either supported by
     * StrongLoop or community.
     */
    Object.values(connectors).forEach(connector => {
      const support = connector.supportedByStrongLoop
        ? '(supported by StrongLoop)'
        : '(provided by community)';
      connectorChoices.push({
        name: `${connector.description} ${chalk.gray(support)}`,
        value: connector.name,
      });
    });

    this.connectorChoices = connectorChoices;
    // Add `other` so users can add a connector that isn't part of the list
    // Though it can be added by creating a PR and adding it to
    // connectors.json
    this.connectorChoices.push('other');

    return super._setupGenerator();
  }

  setOptions() {
    return super.setOptions();
  }

  /**
   * Ensure CLI is being run in a LoopBack 4 project.
   */
  checkLoopBackProject() {
    return super.checkLoopBackProject();
  }

  /**
   * Ask for DataSource Name -- Must be unique
   */
  promptArtifactName() {
    debug('Prompting for artifact name');
    if (this.shouldExit()) return false;
    const prompts = [
      {
        type: 'input',
        name: 'name',
        // capitalization
        message: utils.toClassName(this.artifactInfo.type) + ' name:',
        when: this.artifactInfo.name === undefined,
        validate: utils.validateClassName,
      },
    ];

    return this.prompt(prompts).then(props => {
      Object.assign(this.artifactInfo, props);
      return props;
    });
  }

  /**
   * Ask the user to select the connector for the DataSource
   */
  promptConnector() {
    debug('prompting for datasource connector');
    const prompts = [
      {
        name: 'connector',
        message: `Select the connector for ${chalk.yellow(
          this.artifactInfo.name,
        )}:`,
        type: 'list',
        default: 'memory',
        choices: this.connectorChoices,
        when: this.artifactInfo.connector === undefined,
      },
    ];

    return this.prompt(prompts).then(props => {
      Object.assign(this.artifactInfo, props);
      return props;
    });
  }

  /**
   * If the user selected `other` for connector -- ask the user to provide
   * `npm` module name for the connector.
   */
  promptCustomConnectorInfo() {
    if (this.artifactInfo.connector !== 'other') {
      debug('custom connector option was not selected');
      return;
    } else {
      debug('prompting for custom connector');
      const prompts = [
        {
          name: 'customConnector',
          message: "Enter the connector's module name",
          validate: utils.validate,
        },
      ];

      return this.prompt(prompts).then(props => {
        this.artifactInfo.connector = props.customConnector;
        return props;
      });
    }
  }

  /**
   * Prompt the user for connector specific settings -- only applies to
   * connectors in the connectors.json list
   */
  promptConnectorConfig() {
    debug('prompting for connector config');
    // Check to make sure connector is from connectors list (not custom)
    const settings = connectors[this.artifactInfo.connector]
      ? connectors[this.artifactInfo.connector]['settings']
      : {};

    const prompts = [];
    // Create list of questions to prompt the user
    Object.entries(settings).forEach(([key, setting]) => {
      // Set defaults and merge with `setting` to override properties
      const question = Object.assign(
        {},
        {name: key, message: key, suffix: ':'},
        setting,
      );

      /**
       * Allowed Types: string, number, password, object, array, boolean
       * Must be converted to inquirer types -- input, confirm, password
       */
      switch ((setting.type || '').toLowerCase()) {
        case 'string':
        case 'number':
          question.type = 'input';
          break;
        case 'object':
        case 'array':
          question.type = 'input';
          question.validate = utils.validateStringObject(setting.type);
          break;
        case 'boolean':
          question.type = 'confirm';
          break;
        case 'password':
          break;
        default:
          console.warn(
            `Using default input of type input for setting ${key} as ${setting.type ||
              undefined} is not supported`,
          );
          // Default to input type
          question.type = 'input';
      }

      prompts.push(question);
    });

    debug(`connector setting questions - ${JSON.stringify(prompts)}`);

    // If no prompts, we need to return instead of attempting to ask prompts
    if (!prompts.length) return;

    debug('prompting the user - length > 0 for questions');
    // Ask user for prompts
    return this.prompt(prompts).then(props => {
      // Convert user inputs to correct types
      Object.entries(settings).forEach(([key, setting]) => {
        switch ((setting.type || '').toLowerCase()) {
          case 'number':
            props[key] = Number(props[key]);
            break;
          case 'array':
          case 'object':
            if (props[key] == null || props[key] === '') {
              delete props[key];
            } else {
              props[key] = JSON.parse(props[key]);
            }
            break;
        }
      });
      this.artifactInfo = Object.assign(this.artifactInfo, {settings: props});
    });
  }

  install() {
    debug('install npm dependencies');
    const pkgs = [];

    // Connector package.
    const connector = connectors[this.artifactInfo.connector];
    if (connector && connector.package) {
      pkgs.push(
        connector.package.name +
          `${connector.package.version ? '@' + connector.package.version : ''}`,
      );

      debug(`npmModule - ${pkgs[0]}`);
    }

    pkgs.push('@loopback/repository');

    this.npmInstall(pkgs, {save: true});
  }

  /**
   * Scaffold DataSource related files
   * super.scaffold() doesn't provide a way to rename files -- don't call it
   */
  scaffold() {
    // Exit if needed
    if (this.shouldExit()) return false;

    // Setting up data for templates
    this.artifactInfo.className = utils.toClassName(this.artifactInfo.name);
    this.artifactInfo.fileName = utils.kebabCase(this.artifactInfo.name);
    // prettier-ignore
    this.artifactInfo.jsonFileName = `${this.artifactInfo.fileName}.datasource.json`;
    // prettier-ignore
    this.artifactInfo.outFile = `${this.artifactInfo.fileName}.datasource.ts`;

    // Resolved Output Paths.
    const jsonPath = this.destinationPath(
      this.artifactInfo.outDir,
      this.artifactInfo.jsonFileName,
    );
    const tsPath = this.destinationPath(
      this.artifactInfo.outDir,
      this.artifactInfo.outFile,
    );

    // template path
    const classTemplatePath = this.templatePath('datasource.ts.ejs');

    // Debug Info
    debug(`this.artifactInfo.name => ${this.artifactInfo.name}`);
    debug(`this.artifactInfo.className => ${this.artifactInfo.className}`);
    debug(`this.artifactInfo.fileName => ${this.artifactInfo.fileName}`);
    // prettier-ignore
    debug(`this.artifactInfo.jsonFileName => ${this.artifactInfo.jsonFileName}`);
    debug(`this.artifactInfo.outFile => ${this.artifactInfo.outFile}`);
    debug(`jsonPath => ${jsonPath}`);
    debug(`tsPath => ${tsPath}`);

    // Data to save to DataSource JSON file
    const ds = Object.assign(
      {name: this.artifactInfo.name, connector: this.artifactInfo.connector},
      this.artifactInfo.settings,
    );

    // From LB3
    if (ds.connector === 'ibm-object-storage') {
      ds.connector = 'loopback-component-storage';
      ds.provider = 'openstack';
      ds.useServiceCatalog = true;
      ds.useInternal = false;
      ds.keystoneAuthVersion = 'v3';
    }

    debug(`datasource information going to file: ${JSON.stringify(ds)}`);

    // Copy Templates
    this.fs.writeJSON(jsonPath, ds);
    this.fs.copyTpl(classTemplatePath, tsPath, this.artifactInfo);
  }

  async end() {
    await super.end();
  }
};
