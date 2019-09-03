// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const _ = require('lodash');
const ArtifactGenerator = require('../../lib/artifact-generator');
const debug = require('../../lib/debug')('controller-generator');
const inspect = require('util').inspect;
const path = require('path');
const chalk = require('chalk');
const utils = require('../../lib/utils');

// Exportable constants
module.exports = class ControllerGenerator extends ArtifactGenerator {
  // Note: arguments and options should be defined in the constructor.
  constructor(args, opts) {
    super(args, opts);
  }

  static get BASIC() {
    return 'Empty Controller';
  }

  static get REST() {
    return 'REST Controller with CRUD functions';
  }

  _setupGenerator() {
    this.artifactInfo = {
      type: 'controller',
      rootDir: 'src',
    };

    // XXX(kjdelisle): These should be more extensible to allow custom paths
    // for each artifact type.

    this.artifactInfo.outDir = path.resolve(
      this.artifactInfo.rootDir,
      'controllers',
    );
    this.artifactInfo.modelDir = path.resolve(
      this.artifactInfo.rootDir,
      'models',
    );
    this.artifactInfo.repositoryDir = path.resolve(
      this.artifactInfo.rootDir,
      'repositories',
    );

    this.option('controllerType', {
      type: String,
      required: false,
      description: 'Type for the ' + this.artifactInfo.type,
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

  promptArtifactName() {
    if (this.shouldExit()) return;
    return super.promptArtifactName();
  }

  promptArtifactType() {
    debug('Prompting for controller type');
    if (this.shouldExit()) return;

    super.promptWarningMsgForName();
    // inform user what controller/file names will be created
    super.promptClassFileName(
      'controller',
      'controllers',
      utils.toClassName(this.artifactInfo.name),
    );

    return this.prompt([
      {
        type: 'list',
        name: 'controllerType',
        message: 'What kind of controller would you like to generate?',
        when: this.artifactInfo.controllerType === undefined,
        choices: [ControllerGenerator.BASIC, ControllerGenerator.REST],
        default: ControllerGenerator.BASIC,
      },
    ])
      .then(props => {
        Object.assign(this.artifactInfo, props);
        return props;
      })
      .catch(err => {
        debug(`Error during controller type prompt: ${err.stack}`);
        return this.exit(err);
      });
  }

  async promptArtifactCrudVars() {
    if (this.shouldExit()) return;
    if (
      !this.artifactInfo.controllerType ||
      this.artifactInfo.controllerType === ControllerGenerator.BASIC
    ) {
      return;
    }

    let modelList, repositoryList;

    try {
      modelList = await utils.getArtifactList(
        this.artifactInfo.modelDir,
        'model',
      );

      repositoryList = await utils.getArtifactList(
        this.artifactInfo.repositoryDir,
        'repository',
        true,
      );
    } catch (err) {
      return this.exit(err);
    }

    if (_.isEmpty(modelList)) {
      return this.exit(
        `No models found in ${this.artifactInfo.modelDir}.
        ${chalk.yellow(
          'Please visit http://loopback.io/doc/en/lb4/Controller-generator.html for information on how models are discovered',
        )}`,
      );
    }
    if (_.isEmpty(repositoryList)) {
      return this.exit(
        `No repositories found in ${this.artifactInfo.repositoryDir}.
        ${chalk.yellow(
          'Please visit http://loopback.io/doc/en/lb4/Controller-generator.html for information on how repositories are discovered',
        )}`,
      );
    }
    return this.prompt([
      {
        type: 'list',
        name: 'modelName',
        message:
          'What is the name of the model to use with this CRUD repository?',
        choices: modelList,
        when: this.artifactInfo.modelName === undefined,
        default: modelList[0],
        validate: utils.validateClassName,
      },
      {
        type: 'list',
        name: 'repositoryName',
        message: 'What is the name of your CRUD repository?',
        choices: repositoryList,
        when: this.artifactInfo.repositoryName === undefined,
        default: repositoryList[0],
        validate: utils.validateClassName,
      },
      {
        type: 'input',
        name: 'id',
        message: 'What is the name of ID property?',
        when: this.artifactInfo.id === undefined,
        default: 'id',
      },
      {
        type: 'list',
        name: 'idType',
        message: 'What is the type of your ID?',
        choices: ['number', 'string', 'object'],
        when: this.artifactInfo.idType === undefined,
        default: 'number',
      },
      {
        type: 'confirm',
        name: 'idOmitted',
        message: 'Is the id omitted when creating a new instance?',
        default: true,
      },
      {
        type: 'input',
        name: 'httpPathName',
        message: 'What is the base HTTP path name of the CRUD operations?',
        when: this.artifactInfo.httpPathName === undefined,
        default: answers =>
          utils.prependBackslash(
            utils.pluralize(utils.urlSlug(answers.modelName)),
          ),
        validate: utils.validateUrlSlug,
        filter: utils.prependBackslash,
      },
    ])
      .then(props => {
        debug(`props: ${inspect(props)}`);
        Object.assign(this.artifactInfo, props);
        // Ensure that the artifact names are valid.
        [
          this.artifactInfo.name,
          this.artifactInfo.modelName,
          this.artifactInfo.repositoryName,
        ].forEach(item => {
          item = utils.toClassName(item);
        });
        // Create camel-case names for variables.
        this.artifactInfo.repositoryNameCamel = utils.camelCase(
          this.artifactInfo.repositoryName,
        );
        return props;
      })
      .catch(err => {
        debug(`Error during prompt for controller variables: ${err}`);
        return this.exit(err);
      });
  }

  scaffold() {
    // We don't want to call the base scaffold function since it copies
    // all of the templates!
    if (this.shouldExit()) return false;
    this.artifactInfo.className = utils.toClassName(this.artifactInfo.name);
    this.artifactInfo.outFile =
      utils.toFileName(this.artifactInfo.name) + '.controller.ts';
    if (debug.enabled) {
      debug(`Artifact output filename set to: ${this.artifactInfo.outFile}`);
    }
    this.artifactInfo.modelVariableName = utils.toVarName(
      this.artifactInfo.modelName,
    );

    // renames the file
    let template = 'controller-template.ts.ejs';
    switch (this.artifactInfo.controllerType) {
      case ControllerGenerator.REST:
        template = 'controller-rest-template.ts.ejs';
        break;
      default:
        break;
    }
    const source = this.templatePath(path.join('src', 'controllers', template));
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
    this.copyTemplatedFiles(source, dest, this.artifactInfo);
    return;
  }

  async end() {
    await super.end();
  }
};
