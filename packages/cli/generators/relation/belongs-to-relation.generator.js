// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const BaseRelationGenerator = require('./base-relation.generator');
const utils = require('../../lib/utils');
const relationUtils = require('./utils.generator');

const CONTROLLER_TEMPLATE_PATH_BELONGS_TO =
  'controller-relation-template-belongs-to.ts.ejs';

module.exports = class BelongsToRelationGenerator extends BaseRelationGenerator {
  constructor(args, opts) {
    super(args, opts);
  }

  async generateControllers(options) {
    this.artifactInfo.sourceModelPrimaryKey = options.sourceModelPrimaryKey;
    this.artifactInfo.sourceModelPrimaryKeyType =
      options.sourceModelPrimaryKeyType;
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

    this.artifactInfo.sourceModelName = utils.toFileName(options.sourceModel);
    this.artifactInfo.sourceModelPath = utils.pluralize(
      this.artifactInfo.sourceModelName,
    );
    this.artifactInfo.targetModelName = utils.toFileName(
      options.destinationModel,
    );

    this.artifactInfo.relationPropertyName = options.relationName;
    this.artifactInfo.targetModelPrimaryKey =
      options.destinationModelPrimaryKey;
    this.artifactInfo.targetModelPrimaryKeyType =
      options.destinationModelPrimaryKeyType;

    const source = this.templatePath(CONTROLLER_TEMPLATE_PATH_BELONGS_TO);

    this.artifactInfo.name =
      options.sourceModel + '-' + options.destinationModel;
    this.artifactInfo.outFile =
      utils.toFileName(this.artifactInfo.name) + '.controller.ts';

    const dest = this.destinationPath(
      path.join(this.artifactInfo.outDir, this.artifactInfo.outFile),
    );

    this.copyTemplatedFiles(source, dest, this.artifactInfo);
    await relationUtils.addExportController(
      this,
      path.resolve(this.artifactInfo.outDir, 'index.ts'),
      this.artifactInfo.controllerClassName,
      utils.toFileName(this.artifactInfo.name) + '.controller',
    );
  }

  async generateModels(options) {
    const modelDir = this.artifactInfo.modelDir;
    const sourceModel = options.sourceModel;

    const targetModel = options.destinationModel;
    const relationType = options.relationType;
    const relationName = options.relationName;
    const fktype = options.destinationModelPrimaryKeyType;

    const project = new relationUtils.AstLoopBackProject();
    const sourceFile = relationUtils.addFileToProject(
      project,
      modelDir,
      sourceModel,
    );
    const sourceClass = relationUtils.getClassObj(sourceFile, sourceModel);

    relationUtils.doesRelationExist(sourceClass, relationName);

    const modelProperty = this.getBelongsTo(targetModel, relationName, fktype);

    relationUtils.addProperty(sourceClass, modelProperty);
    const imports = relationUtils.getRequiredImports(targetModel, relationType);
    relationUtils.addRequiredImports(sourceFile, imports);

    sourceClass.formatText();
    await sourceFile.save();
  }

  getBelongsTo(className, relationName, fktype) {
    return {
      decorators: [{name: 'belongsTo', arguments: [`() =>  ${className}`]}],
      name: relationName,
      type: fktype,
    };
  }

  _getRepositoryRequiredImports(dstModelClassName, dstRepositoryClassName) {
    const importsArray = super._getRepositoryRequiredImports(
      dstModelClassName,
      dstRepositoryClassName,
    );
    importsArray.push({
      name: 'BelongsToAccessor',
      module: '@loopback/repository',
    });
    return importsArray;
  }

  _getRepositoryRelationPropertyName() {
    return utils.camelCase(this.artifactInfo.dstModelClass);
  }

  _initializeProperties(options) {
    super._initializeProperties(options);
    this.artifactInfo.dstModelPrimaryKey = options.destinationModelPrimaryKey;
  }

  _getRepositoryRelationPropertyType() {
    return (
      `BelongsToAccessor<` +
      `${utils.toClassName(this.artifactInfo.dstModelClass)}` +
      `, typeof ${utils.toClassName(this.artifactInfo.srcModelClass)}` +
      `.prototype.${this.artifactInfo.srcModelPrimaryKey}>`
    );
  }

  _addCreatorToRepositoryConstructor(classConstructor) {
    const relationPropertyName = this._getRepositoryRelationPropertyName();
    const statement =
      `this.${relationPropertyName} = ` +
      `this.createBelongsToAccessorFor('` +
      `${this.artifactInfo.relationName.replace(/Id$/, '')}',` +
      ` ${utils.camelCase(this.artifactInfo.dstRepositoryClassName)}` +
      `Getter,);`;
    classConstructor.insertStatements(1, statement);
  }

  _registerInclusionResolverForRelation(classConstructor, options) {
    const relationPropertyName = this._getRepositoryRelationPropertyName();
    if (options.registerInclusionResolver) {
      const statement =
        `this.registerInclusionResolver(` +
        `'${relationPropertyName}', this.${relationPropertyName}.inclusionResolver);`;
      classConstructor.insertStatements(2, statement);
    }
  }
};
