// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
// Author: Raphael Drai at r.drai@f5.com

'use strict';

const _ = require('lodash');
const ArtifactGenerator = require('../../lib/artifact-generator');
const path = require('path');
const utils = require('../../lib/utils');

const CONTROLLER_TEMPLATE_PATH_HAS_MANY = 'controller-relation-template-has-many.ts.ejs';
const CONTROLLER_TEMPLATE_PATH_HAS_ONE = 'controller-relation-template-has-one.ts.ejs';
const CONTROLLER_TEMPLATE_PATH_BELONGS_TO = 'controller-relation-template-belongsto.ts.ejs';

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

  generateControllerRelationBelongsTo(options) {
    this.artifactInfo.sourceModelClassName = options.sourceModel;
    this.artifactInfo.targetModelClassName = options.destinationModel;
    this.artifactInfo.sourceRepositoryClassName =
      this.artifactInfo.sourceModelClassName + 'Repository';
    this.artifactInfo.controllerClassName =
      this.artifactInfo.sourceModelClassName + this.artifactInfo.targetModelClassName + 'Controller';

    this.artifactInfo.paramSourceRepository = utils.camelCase(
      this.artifactInfo.sourceModelClassName + 'Repository',
    );

    this.artifactInfo.sourceModelName = utils.kebabCase(options.sourceModel);
    this.artifactInfo.targetModelName = utils.kebabCase(options.destinationModel);

    this.artifactInfo.relationPropertyName = options.relationName;

    const source = this.templatePath(CONTROLLER_TEMPLATE_PATH_BELONGS_TO);

    this.artifactInfo.name = options.sourceModel + '-' + options.destinationModel;
    this.artifactInfo.outFile = utils.kebabCase(this.artifactInfo.name) + '.controller.ts';

    const dest = this.destinationPath(
      path.join(this.artifactInfo.outDir, this.artifactInfo.outFile),
    );

    this.copyTemplatedFiles(source, dest, this.artifactInfo);
    return;
  }

  generateControllerRelationHasMany(options) {
    this.artifactInfo.sourceModelClassName = options.sourceModel;
    this.artifactInfo.targetModelClassName = options.destinationModel;
    this.artifactInfo.sourceRepositoryClassName =
      this.artifactInfo.sourceModelClassName + 'Repository';
    this.artifactInfo.controllerClassName =
      this.artifactInfo.sourceModelClassName + this.artifactInfo.targetModelClassName + 'Controller';
    this.artifactInfo.paramSourceRepository = utils.camelCase(
      this.artifactInfo.sourceModelClassName + 'Repository',
    );

    this.artifactInfo.sourceModelName = utils.kebabCase(options.sourceModel);
    this.artifactInfo.targetModelName = utils.kebabCase(options.destinationModel);
    this.artifactInfo.relationPropertyName = options.destinationModel;
    this.artifactInfo.foreignKey = options.foreignKey;
    this.artifactInfo.foreignKeyType = options.foreignKeyType;

    const source = this.templatePath(CONTROLLER_TEMPLATE_PATH_HAS_MANY);

    this.artifactInfo.name = options.sourceModel + '-' + options.destinationModel;
    this.artifactInfo.outFile = utils.kebabCase(this.artifactInfo.name) + '.controller.ts';

    const dest = this.destinationPath(
      path.join(this.artifactInfo.outDir, this.artifactInfo.outFile),
    );

    this.copyTemplatedFiles(source, dest, this.artifactInfo);
    return;
  }

  generateControllerRelationHasOne(options) {
    throw new Error('Not implemented');
  }

  addFileToProject(project, fileName) {
    try {
      return project.addExistingSourceFile(fileName);
    } catch (e) {
      throw new Error("source model file: '" + fileName + "' is not found.");
    }
  }
};
