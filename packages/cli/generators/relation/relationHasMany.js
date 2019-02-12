'use strict';

const path = require('path');
const RelationGenerator = require('./relation');
const utils = require('../../lib/utils');

const CONTROLLER_TEMPLATE_PATH_HAS_MANY =
  'controller-relation-template-has-many.ts.ejs';

module.exports = class RelationHasMany extends RelationGenerator {
  constructor(args, opts) {
    super(args, opts);
  }

  generateControllers(options) {
    this.artifactInfo.sourceModelClassName = options.sourceModel;
    this.artifactInfo.targetModelClassName = options.destinationModel;
    this.artifactInfo.sourceRepositoryClassName =
      this.artifactInfo.sourceModelClassName + 'Repository';
    this.artifactInfo.controllerClassName =
      this.artifactInfo.sourceModelClassName +
      this.artifactInfo.targetModelClassName +
      'Controller';
    this.artifactInfo.paramSourceRepository = utils.camelCase(
      this.artifactInfo.sourceModelClassName + 'Repository',
    );

    this.artifactInfo.sourceModelName = utils.kebabCase(options.sourceModel);
    this.artifactInfo.targetModelName = utils.kebabCase(
      options.destinationModel,
    );
    this.artifactInfo.relationPropertyName = options.destinationModel;
    this.artifactInfo.sourceModelPrimaryKey = options.sourceModelPrimaryKey;
    this.artifactInfo.sourceModelPrimaryKeyType =
      options.sourceModelPrimaryKeyType;

    const source = this.templatePath(CONTROLLER_TEMPLATE_PATH_HAS_MANY);

    this.artifactInfo.name =
      options.sourceModel + '-' + options.destinationModel;
    this.artifactInfo.outFile =
      utils.kebabCase(this.artifactInfo.name) + '.controller.ts';

    const dest = this.destinationPath(
      path.join(this.artifactInfo.outDir, this.artifactInfo.outFile),
    );

    this.copyTemplatedFiles(source, dest, this.artifactInfo);
    return;
  }

  generateModels(options) {
    throw new Error('Not implemented');
  }

  generateRepositories(options) {
    throw new Error('Not implemented');
  }
};
