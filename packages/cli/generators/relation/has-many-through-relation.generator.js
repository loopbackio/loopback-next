// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const ast = require('ts-morph');
const path = require('path');
const BaseRelationGenerator = require('./base-relation.generator');
const relationUtils = require('./utils.generator');
const utils = require('../../lib/utils');

const CONTROLLER_TEMPLATE_PATH_HAS_MANY_THROUGH =
  'controller-relation-template-has-many-through.ts.ejs';

module.exports = class HasManyThroughRelationGenerator extends BaseRelationGenerator {
  constructor(args, opts) {
    super(args, opts);
  }

  async generateControllers(options) {
    this.artifactInfo.sourceModelClassName = options.sourceModel;
    this.artifactInfo.targetModelClassName = options.destinationModel;
    this.artifactInfo.throughModelClassName = options.throughModel;
    // source
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
    // through
    this.artifactInfo.throughRepositoryClassName =
      this.artifactInfo.throughModelClassName + 'Repository';
    this.artifactInfo.paramThroughRepository = utils.camelCase(
      this.artifactInfo.throughModelClassName + 'Repository',
    );
    this.artifactInfo.throughModelName = utils.toFileName(options.throughModel);
    // target
    this.artifactInfo.targetModelName = utils.toFileName(
      options.destinationModel,
    );
    this.artifactInfo.targetRepositoryClassName =
      this.artifactInfo.targetModelName + 'Repository';
    this.artifactInfo.paramTargetRepository = utils.camelCase(
      this.artifactInfo.targetModelName + 'Repository',
    );
    this.artifactInfo.targetModelPath = utils.pluralize(
      this.artifactInfo.targetModelName,
    );
    this.artifactInfo.targetModelRequestBody = utils.camelCase(
      this.artifactInfo.targetModelName,
    );
    this.artifactInfo.relationPropertyName = options.relationName;

    this.artifactInfo.sourceModelPrimaryKey = options.sourceModelPrimaryKey;
    this.artifactInfo.sourceModelPrimaryKeyType =
      options.sourceModelPrimaryKeyType;
    this.artifactInfo.throughModelPrimaryKey = options.throughModelPrimaryKey;
    this.artifactInfo.throughModelPrimaryKeyType =
      options.throughModelPrimaryKeyType;
    this.artifactInfo.targetModelPrimaryKey = options.targetModelPrimaryKey;
    this.artifactInfo.foreignKeyName = options.foreignKeyName;
    const source = this.templatePath(CONTROLLER_TEMPLATE_PATH_HAS_MANY_THROUGH);

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
    const throughModel = options.throughModel;
    const targetModel = options.destinationModel;
    // hasManyThrough is part of hasMany
    const relationType = 'hasMany';
    const relationName = options.relationName;
    const sourceKey = options.sourceKeyOnThrough;
    const targetKey = options.targetKeyOnThrough;
    const dftSourceKey = options.defaultSourceKeyOnThrough;
    const dftTargetKey = options.defaultTargetKeyOnThrough;
    const sourceKeyType = options.sourceModelPrimaryKeyType;
    const targetKeyType = options.destinationModelPrimaryKeyType;

    // checks if both target and source key exist in through model
    const project = new relationUtils.AstLoopBackProject();
    const throughFile = relationUtils.addFileToProject(
      project,
      modelDir,
      throughModel,
    );

    const throughClass = relationUtils.getClassObj(throughFile, throughModel);
    const doesSourceKeyExist = relationUtils.doesPropertyExist(
      throughClass,
      sourceKey,
    );
    const doesTargetKeyExist = relationUtils.doesPropertyExist(
      throughClass,
      targetKey,
    );

    let modelProperty;
    // checks if the relation name already exists
    const sourceFile = relationUtils.addFileToProject(
      project,
      modelDir,
      sourceModel,
    );
    const sourceClass = relationUtils.getClassObj(sourceFile, sourceModel);
    relationUtils.doesRelationExist(sourceClass, relationName);
    // add the relation to the source model
    const isDefaultSourceKey = sourceKey === dftSourceKey;
    const isDefaultTargetKey = targetKey === dftTargetKey;
    modelProperty = this.getHasManyThrough(
      targetModel,
      throughModel,
      relationName,
      isDefaultSourceKey,
      sourceKey,
      isDefaultTargetKey,
      targetKey,
    );
    relationUtils.addProperty(sourceClass, modelProperty);
    let imports;
    // no need to import target model for self-through case
    if (!(sourceModel === targetModel)) {
      imports = relationUtils.getRequiredImports(targetModel, relationType);
      relationUtils.addRequiredImports(sourceFile, imports);
    }
    imports = relationUtils.getRequiredImports(throughModel, relationType);
    relationUtils.addRequiredImports(sourceFile, imports);
    await sourceFile.save();

    // checks if fks exist in through
    if (doesSourceKeyExist) {
      if (
        !relationUtils.isValidPropertyType(
          throughClass,
          sourceKey,
          sourceKeyType,
        )
      ) {
        throw new Error('SourceKeyOnThrough Type Error');
      }
    } else {
      modelProperty = relationUtils.addForeignKey(sourceKey, sourceKeyType);
      relationUtils.addProperty(throughClass, modelProperty);
      throughClass.formatText();
    }

    if (doesTargetKeyExist) {
      if (
        !relationUtils.isValidPropertyType(
          throughClass,
          targetKey,
          targetKeyType,
        )
      ) {
        throw new Error('TargetKeyOnThrough Type Error');
      }
    } else {
      modelProperty = relationUtils.addForeignKey(targetKey, targetKeyType);
      relationUtils.addProperty(throughClass, modelProperty);
      throughClass.formatText();
      await throughFile.save();
    }
  }

  getHasManyThrough(
    targetClass,
    throughModel,
    relationName,
    isDefaultSourceKey,
    sourceKey,
    isDefaultTargetKey,
    targetKey,
  ) {
    let keyFrom = '';
    let keyTo = '';
    if (!isDefaultSourceKey) {
      keyFrom = `, keyFrom: '${sourceKey}'`;
    }
    if (!isDefaultTargetKey) {
      keyTo = `, keyTo: '${targetKey}'`;
    }

    const relationDecorator = [
      {
        name: 'hasMany',
        arguments: [
          `() => ${targetClass}, {through: {model: () => ${throughModel}${keyFrom}${keyTo}}}`,
        ],
      },
    ];
    return {
      decorators: relationDecorator,
      name: relationName,
      type: targetClass + '[]',
    };
  }

  _addThroughRepoToRepositoryConstructor(repositoryConstructor) {
    const throughRepoGetterName =
      utils.camelCase(this.artifactInfo.throughRepoClassName) + 'Getter';

    if (
      relationUtils.doesParameterExist(
        repositoryConstructor,
        throughRepoGetterName,
      )
    ) {
      // no need to check if the getter already exists
      return;
    }

    repositoryConstructor.addParameter({
      decorators: [
        {
          name: 'repository.getter',
          arguments: ["'" + this.artifactInfo.throughRepoClassName + "'"],
        },
      ],
      name: throughRepoGetterName,
      type: 'Getter<' + this.artifactInfo.throughRepoClassName + '>,',
      scope: ast.Scope.Protected,
    });
  }

  _getRepositoryRequiredImports(dstModelClassName, dstRepositoryClassName) {
    const throughModel = this.artifactInfo.throughModelClass;
    const sourceModel = this.artifactInfo.srcModelClass;
    const throughRepoClassName = this.artifactInfo.throughRepoClassName;
    this.artifactInfo.throughRepoClassName = throughRepoClassName;
    const importsArray = [
      {
        name: dstModelClassName,
        module: '../models',
      },
      {
        name: throughModel,
        module: '../models',
      },
      {
        name: 'repository',
        module: '@loopback/repository',
      },
      {
        name: 'Getter',
        module: '@loopback/core',
      },
      {
        name: throughRepoClassName,
        module: `./${utils.toFileName(throughModel)}.repository`,
      },
      {
        name: 'HasManyThroughRepositoryFactory',
        module: '@loopback/repository',
      },
    ];
    if (!(sourceModel === dstModelClassName)) {
      importsArray.push({
        name: dstRepositoryClassName,
        module: `./${utils.toFileName(dstModelClassName)}.repository`,
      });
    }
    return importsArray;
  }

  _getRepositoryRelationPropertyName() {
    return this.artifactInfo.relationName;
  }

  _getRepositoryRelationPropertyType() {
    return `HasManyThroughRepositoryFactory<${utils.toClassName(
      this.artifactInfo.dstModelClass,
    )}, typeof ${utils.toClassName(
      this.artifactInfo.dstModelClass,
    )}.prototype.${this.artifactInfo.dstModelPrimaryKey},
      ${utils.toClassName(this.artifactInfo.throughModelClass)},
      typeof ${utils.toClassName(this.artifactInfo.srcModelClass)}.prototype.${
      this.artifactInfo.srcModelPrimaryKey
    }
    >`;
  }

  _addCreatorToRepositoryConstructor(classConstructor) {
    const relationPropertyName = this._getRepositoryRelationPropertyName();
    const statement =
      `this.${relationPropertyName} = ` +
      `this.createHasManyThroughRepositoryFactoryFor('${relationPropertyName}', ` +
      `${utils.camelCase(this.artifactInfo.dstRepositoryClassName)}Getter, ` +
      `${utils.camelCase(this.artifactInfo.throughRepoClassName)}Getter,);`;
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
