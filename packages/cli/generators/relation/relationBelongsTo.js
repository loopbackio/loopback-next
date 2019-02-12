'use strict';

const ast = require('ts-simple-ast');
const path = require('path');
const RelationGenerator = require('./relation');
const utils = require('../../lib/utils');
const relationUtils = require('./relationutils');

const CONTROLLER_TEMPLATE_PATH_BELONGS_TO =
  'controller-relation-template-belongs-to.ts.ejs';

module.exports = class RelationBelongsTo extends RelationGenerator {
  constructor(args, opts) {
    super(args, opts);
  }

  generateControllers(options) {
    this.artifactInfo.sourceModelClassName = options.sourceModel;
    this.artifactInfo.targetModelClassName = options.destinationModel;
    this.artifactInfo.paramTargetModel = utils.camelCase(
      options.destinationModel,
    );
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

    this.artifactInfo.relationPropertyName = options.relationName;
    this.artifactInfo.sourceModelPrimaryKey = options.sourceModelPrimaryKey;
    this.artifactInfo.sourceModelPrimaryKeyType =
      options.sourceModelPrimaryKeyType;

    const source = this.templatePath(CONTROLLER_TEMPLATE_PATH_BELONGS_TO);

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
    let path = this.artifactInfo.modelDir;
    let sourceModel = options.sourceModel;
    let targetModel = options.destinationModel;
    let relationType = options.relationType;
    let relationName = options.relationName;
    let fktype = options.sourceModelPrimaryKeyType;

    // add keyTo when needed in both hasMany and belongsTo relation

    let project = new ast.Project();

    const sourceFile = relationUtils.addFileToProject(
      project,
      path,
      utils.kebabCase(sourceModel),
    );

    const targetFile = relationUtils.addFileToProject(
      project,
      path,
      utils.kebabCase(targetModel),
    );

    const sourceClass = relationUtils.getClassObj(sourceFile, sourceModel);

    const targetClass = relationUtils.getClassObj(targetFile, targetModel);

    if (!relationUtils.isClassExist(sourceFile)) {
      return;
    }
    if (!relationUtils.isClassExist(targetFile)) {
      return;
    }

    let modelProperty;

    relationUtils.isRelationExist(sourceClass, relationName);
    modelProperty = this.getBelongsTo(
      targetModel,
      relationName,
      utils.toClassName(fktype),
    );

    relationUtils.addPropertyToModel(sourceClass, modelProperty);
    relationUtils.addRequiredImports(
      sourceFile,
      targetModel,
      relationType,
      targetModel,
    );
    sourceClass.formatText();
    sourceFile.save();
  }

  generateRepositories(options) {
    throw new Error('Not implemented');
  }

  getBelongsTo(className, relationName, fktype) {
    let relationProperty;
    relationProperty = {
      decorators: [{name: 'belongsTo', arguments: ['() => ' + className]}],
      name: relationName,
      type: fktype,
    };
    return relationProperty;
  }
};
