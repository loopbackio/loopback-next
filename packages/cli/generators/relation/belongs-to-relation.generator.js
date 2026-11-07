// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
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

module.exports = class BelongsToRelationGenerator extends (
  BaseRelationGenerator
) {
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
    this.artifactInfo.keyTo = options.keyTo;
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
    // for repo to generate relation name
    this.artifactInfo.relationName = options.relationName;
    const modelDir = this.artifactInfo.modelDir;
    const sourceModel = options.sourceModel;

    const targetModel = options.destinationModel;
    const relationType = options.relationType;
    const relationName = options.relationName;
    const defaultRelationName = options.defaultRelationName;
    const foreignKeyName = options.foreignKeyName;
    const keyTo = options.keyTo;
    const fktype = keyTo
      ? relationUtils.getModelPropertyType(modelDir, targetModel, keyTo) ||
        options.destinationModelPrimaryKeyType
      : options.destinationModelPrimaryKeyType;

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

    const modelProperty = this.getBelongsTo(
      targetModel,
      relationName,
      defaultRelationName,
      foreignKeyName,
      fktype,
      keyTo,
      modelPropertyMetadata,
    );

    relationUtils.addProperty(sourceClass, modelProperty);
    const imports = relationUtils.getRequiredImports(
      targetModel,
      relationType,
      sourceModel,
    );
    relationUtils.addRequiredImports(sourceFile, imports);

    sourceClass.formatText();
    await sourceFile.save();
  }

  getBelongsTo(
    className,
    relationName,
    defaultRelationName,
    foreignKeyName,
    fktype,
    keyTo,
    modelPropertyMetadata,
  ) {
    const decoratorArguments = [`() =>  ${className}`];
    const relationOptions = [];
    let cleanedPropertyMetadata = '';
    if (keyTo) {
      relationOptions.push(`keyTo: '${keyTo}'`);
    }
    if (defaultRelationName !== relationName) {
      relationOptions.push(`name: '${relationName}'`);
    }
    if (relationOptions.length) {
      decoratorArguments.push(`{${relationOptions.join(', ')}}`);
    }
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
    const cleanFktype = fktype.replace(/\s*\|\s*undefined/g, '').trim();
    const property = {
      decorators: [
        {
          name: 'belongsTo',
          arguments: decoratorArguments,
        },
      ],
      name: foreignKeyName,
      type: cleanFktype,
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
      this.artifactInfo.srcModelClass,
    );
    importsArray.push({
      name: 'BelongsToAccessor',
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
      `BelongsToAccessor<` +
      `${utils.toClassName(this.artifactInfo.dstModelClass)}` +
      `, typeof ${utils.toClassName(this.artifactInfo.srcModelClass)}` +
      `.prototype.${this.artifactInfo.srcModelPrimaryKey}>`
    );
  }

  _addCreatorToRepositoryConstructor(classConstructor) {
    const relationName = this.artifactInfo.relationName;
    const statement =
      `this.${relationName} = ` +
      `this.createBelongsToAccessorFor('` +
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
