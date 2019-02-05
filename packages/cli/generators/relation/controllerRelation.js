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

const CONTROLLER_TEMPLATE_PATH_HAS_MANY = 'controller-relation-template-has-many.ts.ejs';
const CONTROLLER_TEMPLATE_PATH_HAS_ONE = 'controller-relation-template-has-one.ts.ejs';
const CONTROLLER_TEMPLATE_PATH_BELONGSTO = 'controller-relation-template-belongsto.ts.ejs';

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

  generateControllerRelationBelongsTo(
    sourceModel,
    targetModel,
    foreignKey,
    relationName,
  ) {
    this.artifactInfo.sourceModelClassName = sourceModel;
    this.artifactInfo.targetModelClassName = targetModel;
    this.artifactInfo.sourceRepositoryClassName =
      this.artifactInfo.sourceModelClassName + 'Repository';
    this.artifactInfo.controllerClassName =
      this.artifactInfo.sourceModelClassName + this.artifactInfo.targetModelClassName + 'Controller';

    this.artifactInfo.paramSourceRepository = utils.camelCase(
      this.artifactInfo.sourceModelClassName + 'Repository',
    );

    this.artifactInfo.sourceModelName = utils.kebabCase(sourceModel);
    this.artifactInfo.targetModelName = utils.kebabCase(targetModel);

    this.artifactInfo.relationPropertyName = 'fooo';

    const source = this.templatePath(CONTROLLER_TEMPLATE_PATH_BELONGSTO);

    this.artifactInfo.name = sourceModel + '-' + targetModel;
    this.artifactInfo.outFile = utils.kebabCase(this.artifactInfo.name) + '.controller.ts';

    const dest = this.destinationPath(
      path.join(this.artifactInfo.outDir, this.artifactInfo.outFile),
    );

    this.copyTemplatedFiles(source, dest, this.artifactInfo);
    return;
  }


  generateControllerRelationHasMany(
    sourceModel,
    targetModel,
    foreignKey,
    relationName,
  ) {
    this.artifactInfo.sourceModelClassName = sourceModel;
    this.artifactInfo.targetModelClassName = targetModel;
    this.artifactInfo.sourceRepositoryClassName =
      this.artifactInfo.sourceModelClassName + 'Repository';
    this.artifactInfo.controllerClassName =
      this.artifactInfo.sourceModelClassName + this.artifactInfo.targetModelClassName + 'Controller';
    this.artifactInfo.paramSourceRepository = utils.camelCase(
      this.artifactInfo.sourceModelClassName + 'Repository',
    );

    this.artifactInfo.sourceModelName = utils.kebabCase(sourceModel);
    this.artifactInfo.targetModelName = utils.kebabCase(targetModel);

    const source = this.templatePath(CONTROLLER_TEMPLATE_PATH_HAS_MANY);

    this.artifactInfo.name = sourceModel + '-' + targetModel;
    this.artifactInfo.outFile = utils.kebabCase(this.artifactInfo.name) + '.controller.ts';

    const dest = this.destinationPath(
      path.join(this.artifactInfo.outDir, this.artifactInfo.outFile),
    );

    this.copyTemplatedFiles(source, dest, this.artifactInfo);
    return;
  }

  generateControllerRelationHasOne(
    sourceModel,
    targetModel,
    foreignKey,
    relationName,
  ) {
    throw new Error('Not implemented');
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
