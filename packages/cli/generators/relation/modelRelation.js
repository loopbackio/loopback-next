'use strict';
const ArtifactGenerator = require('../../lib/artifact-generator');
const debug = require('../../lib/debug')('relation-generator');
const inspect = require('util').inspect;
const path = require('path');
const chalk = require('chalk');
const utils = require('../../lib/utils');
const ast = require('ts-simple-ast');

module.exports = class ModelRelation extends ArtifactGenerator {
  _setupGenerator() {
    super._setupGenerator();
    this.artifactInfo = {
      type: 'relation',
      rootDir: utils.sourceRootDir,
    };

    this.artifactInfo.modelDir = path.resolve(
      this.artifactInfo.rootDir,
      'models',
    );
  }

  generateRelationModel(options) {
    let modelPath = this.artifactInfo.modelDir;
    this.generateModel(
      this.options.sourceModel,
      this.options.destinationModel,
      this.options.relationType,
      modelPath,
      this.options.foreignKey,
      this.options.relationName,
      this.options.foreignKeyType,
    );
  }

  addFileToProject(project, path, modelName) {
    const fileName = path + '/' + modelName + '.model.ts';
    return project.addExistingSourceFile(fileName);
  }

  getClassesCount(fileName) {
    return fileName.getClasses().length;
  }

  getClassObj(fileName, modelName) {
    return fileName.getClassOrThrow(modelName);
  }

  isClassExist(fileName) {
    return this.getClassesCount(fileName) == 1;
  }

  getPropertiesCount(classObj) {
    return classObj.getProperties().length;
  }

  getPropertyStartPos(classObj) {
    return classObj
      .getChildSyntaxList()
      .getChildAtIndex(this.getPropertiesCount(classObj) - 1)
      .getPos();
  }

  getClassProperties(classObj) {
    return classObj.getProperties();
  }

  isPropertyExist(classObj, propertyName) {
    return this.getClassProperties(classObj)
      .map(x => x.getName())
      .includes(propertyName);
  }

  getType(classObj, propertyName) {
    return classObj
      .getProperty(propertyName)
      .getType()
      .getText();
  }
  generateModel(
    sourceModel,
    targetModel,
    relationType,
    path,
    foreignKey,
    relationName,
    fktype,
  ) {
    let project = new ast.Project();

    const sourceFile = this.addFileToProject(
      project,
      path,
      utils.kebabCase(sourceModel),
    );
    if (!this.isClassExist(sourceFile)) {
      return;
    }
    const sourceClass = this.getClassObj(sourceFile, sourceModel);

    const targetFile = this.addFileToProject(
      project,
      path,
      utils.kebabCase(targetModel),
    );
    if (!this.isClassExist(targetFile)) {
      return;
    }
    const targetClass = this.getClassObj(targetFile, targetModel);
    let modelProperty;

    switch (relationType) {
      case 'hasMany':
        if (this.isPropertyExist(sourceClass, relationName)) {
          console.log('property ' + relationName + ' exsist in the model');
          throw new Error(' Property exsists');
        } else {
          modelProperty = this.getHasMany(targetModel, relationName);
        }
        break;
      case 'hasOne':
        if (this.isPropertyExist(sourceClass, relationName)) {
          console.log('property ' + relationName + ' exsist in the model');
          throw new Error(' Property exsists');
        } else {
          modelProperty = this.getHasOne(targetModel, relationName);
        }
        break;
      case 'belongsTo':
        //fix remvove ID
        if (this.isPropertyExist(sourceClass, relationName + 'Id')) {
          console.log('property ' + relationName + 'Id exsist in the model');
          throw new Error(' Property exsists');
        } else {
          modelProperty = this.getBelongsTo(
            targetModel,
            relationName,
            'Number',
          );
        }
        break;
    }
    sourceClass.insertProperty(
      this.getPropertiesCount(sourceClass),
      modelProperty,
    );
    sourceClass.insertText(this.getPropertyStartPos(sourceClass), '\n');
    this.addRequiredImports(sourceFile, targetModel, relationType, targetModel);
    sourceClass.formatText();
    sourceFile.save();
  }

  getHasMany(className, relationName) {
    let relationProperty = {
      decorators: [{name: 'hasMany', arguments: ['() => ' + className]}],
      name: relationName,
      type: className + '[]',
    };

    return relationProperty;
  }

  getHasOne(className, relationName) {
    let relationProperty = {
      decorators: [{name: 'hasOne', arguments: ['() => ' + className]}],
      name: relationName,
      type: className,
    };
    return relationProperty;
  }

  getBelongsTo(className, relationName, fktype) {
    let relationProperty;
    relationProperty = {
      decorators: [{name: 'belongsTo', arguments: ['() => ' + className]}],
      name: relationName + 'Id',
      type: fktype,
    };
    return relationProperty;
  }

  addRequiredImports(sourceFile, targetModel, relationType, targetClassName) {
    let importsArray = this.getRequiredImports(
      targetModel,
      relationType,
      targetClassName,
    );
    while (importsArray.length > 0) {
      let currentImport = importsArray.pop();
      this.addCurrentImport(sourceFile, currentImport);
    }
  }

  getRequiredImports(targetModel, relationType, targetClassName) {
    let importsArray = [
      {
        name: targetClassName,
        module: './' + targetModel + '.model',
      },
      {
        name: relationType,
        module: '@loopback/repository',
      },
    ];

    return importsArray;
  }

  addCurrentImport(sourceFile, currentImport) {
    if (!this.doesModuleExists(sourceFile, currentImport.module)) {
      sourceFile.addImportDeclaration({
        moduleSpecifier: currentImport.module,
      });
    }
    if (!this.doesImportExistInModule(sourceFile, currentImport)) {
      sourceFile
        .getImportDeclarationOrThrow(currentImport.module)
        .addNamedImport(currentImport.name);
    }
  }

  doesModuleExists(sourceFile, moduleName) {
    return sourceFile.getImportDeclaration(moduleName);
  }

  doesImportExistInModule(sourceFile, currentImport) {
    let identicalImport;
    let relevantImports = this.getNamedImportsFromModule(
      sourceFile,
      currentImport.module,
    );
    if (relevantImports.length > 0) {
      identicalImport = relevantImports[0]
        .getNamedImports()
        .filter(imp => imp.getName() == currentImport.name);
    }

    return identicalImport && identicalImport.length > 0;
  }

  getNamedImportsFromModule(sourceFile, moduleName) {
    let allImports = sourceFile.getImportDeclarations();
    let relevantImports = allImports.filter(
      imp => imp.getModuleSpecifierValue() == moduleName,
    );
    return relevantImports;
  }
};
