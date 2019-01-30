// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
// Author: Raphael Drai at r.drai@f5.com

'use strict';

const _ = require('lodash');
const ArtifactGenerator = require('../../lib/artifact-generator');
const debug = require('../../lib/debug')('relation-generator');
const inspect = require('util').inspect;
const path = require('path');
const chalk = require('chalk');
const utils = require('../../lib/utils');
const ast = require('ts-simple-ast');

const CONTROLLER_TEMPLATE_PATH = 'controller-relation-template.ts.ejs';

// Exportable constants
module.exports = class ControllerRelation extends ArtifactGenerator {
  // Note: arguments and options should be defined in the constructor.
  constructor(args, opts) {
    super(args, opts);
  }

  _setupGenerator() {
    super._setupGenerator();
    this.artifactInfo = {
      type: 'relation',
      rootDir: utils.sourceRootDir,
    };

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
  }

  scaffold() {
    // We don't want to call the base scaffold function since it copies
    // all of the templates!
    // we can set here additional specific this.artifactInfo.xxx parameters if needed

    return;
  }

  generateRelationController(
    sourceModel,
    targetModel,
    foreignKey,
    relationName,
  ) {
    let project = new ast.Project();
    const sourceFile = this.addFileToProject(
      project,
      this.artifactInfo.modelDir + '/' + this.options.sourceModel + '.model.ts',
    );
    this.options.keyType = this.getKeyType(sourceFile, this.options.foreignKey);

    this.artifactInfo.foreignKey = foreignKey;
    this.artifactInfo.keyType = this.options.keyType;
    this.artifactInfo.repositoryVariableName = utils.camelCase(
      sourceModel + 'Repo',
    );
    this.artifactInfo.srcModel = utils.camelCase(sourceModel);
    this.artifactInfo.dstModel = utils.camelCase(targetModel);
    this.artifactInfo.modelName = utils.toClassName(targetModel);
    this.artifactInfo.className = utils.toClassName(
      this.artifactInfo.srcModel + this.artifactInfo.modelName,
    );
    this.artifactInfo.repositoryName = utils.toClassName(
      this.artifactInfo.srcModel + 'Repository',
    );
    this.artifactInfo.relationModel = utils.toClassName(
      this.artifactInfo.srcModel + '.' + this.artifactInfo.modelName,
    );

    this.artifactInfo.name = utils.camelCase(sourceModel + '-' + targetModel);

    this.artifactInfo.httpPathName = '/' + sourceModel + 's';
    if (this.shouldExit()) return false;

    this.artifactInfo.outFile =
      utils.kebabCase(this.artifactInfo.name) + '.controller.ts';
    if (debug.enabled) {
      debug('Artifact output filename set to: ${this.artifactInfo.outFile}');
    }

    // renames the file
    let template = CONTROLLER_TEMPLATE_PATH;

    const source = this.templatePath(template);
    if (debug.enabled) {
      debug('Using template at: ${source}');
    }
    const dest = this.destinationPath(
      path.join(this.artifactInfo.outDir, this.artifactInfo.outFile),
    );

    if (debug.enabled) {
      debug('artifactInfo: ${inspect(this.artifactInfo)}');
      debug('Copying artifact to: ${dest}');
    }

    this.copyTemplatedFiles(source, dest, this.artifactInfo);
    return;
  }

  getKeyType(sourceFile, propertyName) {
    const classObj = this.getClassObj(sourceFile);
    if (
      classObj
        .getProperties()
        .map(x => x.getName())
        .includes(propertyName)
    ) {
      return classObj
        .getProperty(propertyName)
        .getType()
        .getText();
    }
  }

  getClassObj(fileName) {
    const className = fileName.getClasses()[0].getNameOrThrow();
    return fileName.getClassOrThrow(className);
  }

  addFileToProject(project, fileName) {
    try {
      return project.addExistingSourceFile(fileName);
    } catch (e) {
      throw new Error("source model file: '" + fileName + "' is not found.");
    }
  }
};
