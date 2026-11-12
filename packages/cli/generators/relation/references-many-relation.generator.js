// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const BaseRelationGenerator = require('./base-relation.generator');
const utils = require('../../lib/utils');
const relationUtils = require('./utils.generator');

module.exports = class ReferencesManyRelationGenerator extends (
  BaseRelationGenerator
) {
  constructor(args, opts) {
    super(args, opts);
  }

  async generateControllers(options) {
    // no controllers
  }

  async generateModels(options) {
    // for repo to generate relation name
    this.artifactInfo.relationName = options.relationName;
    const modelDir = this.artifactInfo.modelDir;
    const sourceModel = options.sourceModel;

    const targetModel = options.destinationModel;
    const relationType = options.relationType;
    const relationName = options.relationName;
    const defaultRelationName = options.defaultRelationName;
    const foreignKeyName = options.foreignKeyName;
    const fkType = options.destinationModelPrimaryKeyType;

    const project = new relationUtils.AstLoopBackProject();
    const sourceFile = relationUtils.addFileToProject(
      project,
      modelDir,
      sourceModel,
    );
    const sourceClass = relationUtils.getClassObj(sourceFile, sourceModel);
    const modelPropertyMetadata = relationUtils.getPropertyMetadata(
      sourceClass,
      foreignKeyName,
    );
    // this checks if the foreign key already exists, so the 2nd param should be foreignKeyName
    relationUtils.doesRelationExist(sourceClass, foreignKeyName);

    const modelProperty = this.getReferencesMany(
      targetModel,
      relationName,
      defaultRelationName,
      foreignKeyName,
      fkType,
      modelPropertyMetadata,
    );

    relationUtils.addProperty(sourceClass, modelProperty);
    const imports = relationUtils.getRequiredImports(targetModel, relationType);
    relationUtils.addRequiredImports(sourceFile, imports);

    sourceClass.formatText();
    await sourceFile.save();
  }

  getReferencesMany(
    className,
    relationName,
    defaultRelationName,
    foreignKeyName,
    fkType,
    modelPropertyMetadata,
  ) {
    const decoratorArguments = [`() => ${className}`];
    const relationOptions = [];
    if (defaultRelationName !== relationName) {
      relationOptions.push(`name: '${relationName}'`);
    }
    if (relationOptions.length) {
      decoratorArguments.push(`{${relationOptions.join(', ')}}`);
    }
    let cleanedPropertyMetadata = '';
    if (modelPropertyMetadata && modelPropertyMetadata.trim() !== '') {
      // Strip outer braces if modelPropertyMetadata is passed as a braced string like "{ nullable: true }"
      cleanedPropertyMetadata = modelPropertyMetadata
        .replace(/^\{|\}$/g, '')
        .trim();
    }
    if (cleanedPropertyMetadata) {
      if (decoratorArguments.length === 1) {
        decoratorArguments.push('{}');
      }
      decoratorArguments.push(`{${cleanedPropertyMetadata}}`);
    }
    let isPropertyOptional = false;
    if (
      modelPropertyMetadata &&
      modelPropertyMetadata.includes('nullable: true')
    ) {
      isPropertyOptional = true;
    }
    const cleanFkType = fkType.replace(/\s*\|\s*undefined/g, '').trim();
    const property = {
      decorators: [
        {
          name: 'referencesMany',
          arguments: decoratorArguments,
        },
      ],
      name: foreignKeyName,
      type: `${cleanFkType}[]`,
    };
    if (isPropertyOptional) {
      property.hasQuestionToken = isPropertyOptional;
    }
    return property;
  }

  _getRepositoryRequiredImports(dstModelClassName, dstRepositoryClassName) {
    const importsArray = super._getRepositoryRequiredImports(
      dstModelClassName,
      dstRepositoryClassName,
    );
    importsArray.push({
      name: 'ReferencesManyAccessor',
      module: '@loopback/repository',
    });
    return importsArray;
  }

  _getRepositoryRelationPropertyName() {
    return this.artifactInfo.relationName;
  }

  _initializeProperties(options) {
    super._initializeProperties(options);
    this.artifactInfo.dstModelPrimaryKey = options.destinationModelPrimaryKey;
  }

  _getRepositoryRelationPropertyType() {
    return (
      `ReferencesManyAccessor<` +
      `${utils.toClassName(this.artifactInfo.dstModelClass)}` +
      `, typeof ${utils.toClassName(this.artifactInfo.srcModelClass)}` +
      `.prototype.${this.artifactInfo.srcModelPrimaryKey}>`
    );
  }

  _addCreatorToRepositoryConstructor(classConstructor) {
    const relationName = this.artifactInfo.relationName;
    const statement =
      `this.${relationName} = ` +
      `this.createReferencesManyAccessorFor('` +
      `${relationName}',` +
      ` ${utils.camelCase(this.artifactInfo.dstRepositoryClassName)}` +
      `Getter,);`;
    classConstructor.insertStatements(1, statement);
  }

  _registerInclusionResolverForRelation(classConstructor, options) {
    const relationName = this.artifactInfo.relationName;
    if (options.registerInclusionResolver) {
      const statement =
        `this.registerInclusionResolver(` +
        `'${relationName}', this.${relationName}.inclusionResolver);`;
      classConstructor.insertStatements(2, statement);
    }
  }
};
