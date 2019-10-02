// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const BaseRelationGenerator = require('./base-relation.generator');
const relationUtils = require('./utils.generator');
const utils = require('../../lib/utils');

const CONTROLLER_TEMPLATE_PATH_HAS_MANY =
  'controller-relation-template-has-many.ts.ejs';

module.exports = class HasManyRelationGenerator extends BaseRelationGenerator {
  constructor(args, opts) {
    super(args, opts);
  }

  async generateControllers(options) {
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

    this.artifactInfo.sourceModelName = utils.toFileName(options.sourceModel);
    this.artifactInfo.sourceModelPath = utils.pluralize(
      this.artifactInfo.sourceModelName,
    );
    this.artifactInfo.targetModelName = utils.toFileName(
      options.destinationModel,
    );
    this.artifactInfo.targetModelPath = utils.pluralize(
      this.artifactInfo.targetModelName,
    );
    this.artifactInfo.targetModelRequestBody = utils.camelCase(
      this.artifactInfo.targetModelName,
    );
    this.artifactInfo.relationPropertyName = utils.pluralize(
      utils.camelCase(options.destinationModel),
    );
    this.artifactInfo.sourceModelPrimaryKey = options.sourceModelPrimaryKey;
    this.artifactInfo.sourceModelPrimaryKeyType =
      options.sourceModelPrimaryKeyType;
    this.artifactInfo.targetModelPrimaryKey = options.targetModelPrimaryKey;
    this.artifactInfo.foreignKeyName = options.foreignKeyName;

    const source = this.templatePath(CONTROLLER_TEMPLATE_PATH_HAS_MANY);

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
    const fktype = options.sourceModelPrimaryKeyType;
    const isForeignKeyExist = options.doesForeignKeyExist;
    const foreignKeyName = options.foreignKeyName;

    const isDefaultForeignKey =
      foreignKeyName === utils.camelCase(options.sourceModel) + 'Id';

    let modelProperty;
    const project = new relationUtils.AstLoopBackProject();

    const sourceFile = relationUtils.addFileToProject(
      project,
      modelDir,
      sourceModel,
    );
    const sourceClass = relationUtils.getClassObj(sourceFile, sourceModel);
    relationUtils.doesRelationExist(sourceClass, relationName);

    modelProperty = this.getHasMany(
      targetModel,
      relationName,
      isDefaultForeignKey,
      foreignKeyName,
    );

    relationUtils.addProperty(sourceClass, modelProperty);
    const imports = relationUtils.getRequiredImports(targetModel, relationType);

    relationUtils.addRequiredImports(sourceFile, imports);
    await sourceFile.save();

    const targetFile = relationUtils.addFileToProject(
      project,
      modelDir,
      targetModel,
    );
    const targetClass = relationUtils.getClassObj(targetFile, targetModel);

    if (isForeignKeyExist) {
      if (
        !relationUtils.isValidPropertyType(targetClass, foreignKeyName, fktype)
      ) {
        throw new Error('foreignKey Type Error');
      }
    } else {
      modelProperty = relationUtils.addForeignKey(foreignKeyName, fktype);
      relationUtils.addProperty(targetClass, modelProperty);
      targetClass.formatText();
      await targetFile.save();
    }
  }

  getHasMany(className, relationName, isDefaultForeignKey, foreignKeyName) {
    let relationDecorator = [
      {
        name: 'hasMany',
        arguments: [`() => ${className}, {keyTo: '${foreignKeyName}'}`],
      },
    ];
    if (isDefaultForeignKey) {
      relationDecorator = [
        {name: 'hasMany', arguments: [`() => ${className}`]},
      ];
    }

    return {
      decorators: relationDecorator,
      name: relationName,
      type: className + '[]',
    };
  }

  _getRepositoryRequiredImports(dstModelClassName, dstRepositoryClassName) {
    const importsArray = super._getRepositoryRequiredImports(
      dstModelClassName,
      dstRepositoryClassName,
    );
    importsArray.push({
      name: 'HasManyRepositoryFactory',
      module: '@loopback/repository',
    });
    return importsArray;
  }

  _getRepositoryRelationPropertyName() {
    return utils.pluralize(utils.camelCase(this.artifactInfo.dstModelClass));
  }

  _getRepositoryRelationPropertyType() {
    return `HasManyRepositoryFactory<${utils.toClassName(
      this.artifactInfo.dstModelClass,
    )}, typeof ${utils.toClassName(
      this.artifactInfo.srcModelClass,
    )}.prototype.${this.artifactInfo.srcModelPrimaryKey}>`;
  }

  _addCreatorToRepositoryConstructor(classConstructor) {
    const relationPropertyName = this._getRepositoryRelationPropertyName();
    const statement =
      `this.${relationPropertyName} = ` +
      `this.createHasManyRepositoryFactoryFor('${relationPropertyName}', ` +
      `${utils.camelCase(this.artifactInfo.dstRepositoryClassName)}Getter,);`;
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
