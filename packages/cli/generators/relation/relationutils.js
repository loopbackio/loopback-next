'use strict';

const utils = require('../../lib/utils');

exports.relationType = {
  belongsTo: 'belongsTo',
  hasMany: 'hasMany',
  hasOne: 'hasOne',
};

exports.addFileToProject = function(project, path, modelName) {
  const fileName = path + '/' + modelName + '.model.ts';
  return project.addExistingSourceFile(fileName);
};

exports.getClassObj = function(fileName, modelName) {
  return fileName.getClassOrThrow(modelName);
};

exports.getClassesCount = function(fileName) {
  return fileName.getClasses().length;
};

exports.isPropertyExist = function(classObj, propertyName) {
  return classObj
    .getProperties()
    .map(x => x.getName())
    .includes(propertyName);
};

exports.isRelationExist = function(classObj, propertyName) {
  if (this.isPropertyExist(classObj, propertyName)) {
    console.log('property ' + propertyName + ' exsist in the model');
    throw new Error(' Property exsists');
  }
  return;
};

exports.vlidateType = function(classObj, foriegnKeyName, foriegnKeyType) {
  if (
    utils.lowerCase(
      classObj
        .getProperty(foriegnKeyName)
        .getType()
        .getText(),
    ) != foriegnKeyType
  ) {
    console.log(' foreignKey type has wrong Type ');
    throw new Error('foreginKey Type Error');
  }
  return;
};

exports.addForeginKey = function(foreginKey, sourceModelPrimaryKeyType) {
  let fkProperty = {
    decorators: [
      {
        name: 'property',
        arguments: ["{\n type : '" + sourceModelPrimaryKeyType + "',\n}"],
      },
    ],
    name: foreginKey + '?',
    type: sourceModelPrimaryKeyType,
  };
  return fkProperty;
};

exports.addPropertyToModel = function(classOBj, modelProperty) {
  classOBj.insertProperty(this.getPropertiesCount(classOBj), modelProperty);
  classOBj.insertText(this.getPropertyStartPos(classOBj), '\n');
};

exports.getPropertiesCount = function(classObj) {
  return classObj.getProperties().length;
};

exports.getPropertyStartPos = function(classObj) {
  return classObj
    .getChildSyntaxList()
    .getChildAtIndex(this.getPropertiesCount(classObj) - 1)
    .getPos();
};

exports.addRequiredImports = function(
  sourceFile,
  targetModel,
  relationType,
  targetClassName,
) {
  let importsArray = this.getRequiredImports(
    targetModel,
    relationType,
    targetClassName,
  );
  while (importsArray.length > 0) {
    let currentImport = importsArray.pop();
    this.addCurrentImport(sourceFile, currentImport);
  }
};

exports.getRequiredImports = function(
  targetModel,
  relationType,
  targetClassName,
) {
  let importsArray = [
    {
      name: targetClassName,
      module: './' + utils.kebabCase(targetModel) + '.model',
    },
    {
      name: relationType,
      module: '@loopback/repository',
    },
  ];

  return importsArray;
};

exports.addCurrentImport = function(sourceFile, currentImport) {
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
};

exports.doesModuleExists = function(sourceFile, moduleName) {
  return sourceFile.getImportDeclaration(moduleName);
};

exports.doesImportExistInModule = function(sourceFile, currentImport) {
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
};

exports.getNamedImportsFromModule = function(sourceFile, moduleName) {
  let allImports = sourceFile.getImportDeclarations();
  let relevantImports = allImports.filter(
    imp => imp.getModuleSpecifierValue() == moduleName,
  );
  return relevantImports;
};
