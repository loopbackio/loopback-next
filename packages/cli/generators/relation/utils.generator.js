// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const ast = require('ts-morph');
const path = require('path');
const tsquery = require('../../lib/ast-helper');
const utils = require('../../lib/utils');

exports.relationType = {
  belongsTo: 'belongsTo',
  hasMany: 'hasMany',
};

class AstLoopBackProject extends ast.Project {
  constructor() {
    super({
      manipulationSettings: {
        indentationText: ast.IndentationText.TwoSpaces,
        insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: false,
        newLineKind: ast.NewLineKind.LineFeed,
        quoteKind: ast.QuoteKind.Single,
      },
    });
  }
}
exports.AstLoopBackProject = AstLoopBackProject;

exports.getModelPrimaryKeyProperty = async function(fs, modelDir, modelName) {
  const modelFile = path.join(modelDir, utils.getModelFileName(modelName));

  const fileContent = await fs.read(modelFile, {});
  return tsquery.getIdFromModel(fileContent);
};

exports.getModelPropertyType = function(modelDir, modelName, propertyName) {
  const project = new this.AstLoopBackProject();

  const modelFile = path.join(modelDir, utils.getModelFileName(modelName));
  const sf = project.addExistingSourceFile(modelFile);
  const co = this.getClassObj(sf, modelName);
  return this.getPropertyType(co, propertyName);
};

exports.addFileToProject = function(project, dir, modelName) {
  const fileName = path.resolve(dir, utils.getModelFileName(modelName));
  return project.addExistingSourceFile(fileName);
};

exports.getClassObj = function(fileName, modelName) {
  return fileName.getClassOrThrow(modelName);
};

exports.getClassConstructor = function(classObj) {
  return classObj.getConstructors()[0];
};

exports.addExportController = async function(
  generator,
  fileName,
  controllerClassName,
  controllerFileName,
) {
  const project = new this.AstLoopBackProject();
  let pFile;
  const exportDeclaration = {
    kind: ast.StructureKind.ExportDeclaration,
    moduleSpecifier: './' + controllerFileName,
  };

  if (generator.fs.exists(fileName)) {
    pFile = project.addExistingSourceFile(fileName);
    // Exported declarations is now a `Map<string, Declaration[]>`
    const exportedDeclarations = pFile.getExportedDeclarations();
    for (const declarations of exportedDeclarations.values()) {
      for (const declaration of declarations) {
        if (
          ast.TypeGuards.isClassDeclaration(declaration) &&
          controllerClassName === declaration.getName()
        ) {
          return;
        }
      }
    }
    pFile.addExportDeclaration(exportDeclaration);
  } else {
    pFile = project.createSourceFile(fileName, {
      statements: [exportDeclaration],
    });
  }

  await pFile.save();
};

/**
 * Validate if property exist in class.
 *
 * @param {classObj}
 * @param {propertyName} string
 *
 * @return bool true on success, false on failure.
 */

exports.doesPropertyExist = function(classObj, propertyName) {
  return classObj
    .getProperties()
    .map(x => x.getName())
    .includes(propertyName);
};

exports.doesRelationExist = function(classObj, propertyName) {
  if (this.doesPropertyExist(classObj, propertyName)) {
    // If the property is decorated by `@property()`,
    // turn it to be a relational property decorated by `@belongsTo()`
    const decorators = classObj.getProperty(propertyName).getDecorators();
    const hasPropertyDecorator =
      decorators.length > 0 && decorators[0].getName() === 'property';
    // If it's already decorated by a relational decorator,
    // throw error
    if (!hasPropertyDecorator) {
      throw new Error(
        'relational property ' +
          propertyName +
          ' already exist in the model ' +
          classObj.getName(),
      );
    }

    this.deleteProperty(classObj.getProperty(propertyName));
  }
};

/**
 * Get property type in class.
 *
 * @param {classObj}
 * @param {propertyName} string
 *
 * @return string
 */

exports.getPropertyType = function(classObj, propertyName) {
  return classObj
    .getProperty(propertyName)
    .getType()
    .getText();
};

/**
 * Validate if property with specific type exist in class.
 *
 * @param {classObj}
 * @param {propertyName} string
 * @param {propertyType} string
 *
 * @return bool true on success, false on failure.
 */

exports.isValidPropertyType = function(classObj, propertyName, propertyType) {
  return this.getPropertyType(classObj, propertyName) === propertyType;
};

exports.doesParameterExist = function(classConstructor, parameterName) {
  return classConstructor
    .getParameters()
    .map(x => x.getName())
    .includes(parameterName);
};

exports.addForeignKey = function(foreignKey, sourceModelPrimaryKeyType) {
  return {
    decorators: [
      {
        name: 'property',
        arguments: ["{\n type : '" + sourceModelPrimaryKeyType + "',\n}"],
      },
    ],
    name: foreignKey + '?',
    type: sourceModelPrimaryKeyType,
  };
};

exports.addProperty = function(classOBj, property) {
  classOBj.insertProperty(this.getPropertiesCount(classOBj), property);
  classOBj.insertText(this.getPropertyStartPos(classOBj), '\n');
};

exports.deleteProperty = function(propObj) {
  propObj.remove();
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

exports.addRequiredImports = function(sourceFile, imports) {
  for (const currentImport of imports) {
    this.addCurrentImport(sourceFile, currentImport);
  }
};

exports.getRequiredImports = function(targetModel, relationType) {
  return [
    {
      name: targetModel,
      module: './' + utils.toFileName(targetModel) + '.model',
    },
    {
      name: relationType,
      module: '@loopback/repository',
    },
  ];
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
  const relevantImports = this.getNamedImportsFromModule(
    sourceFile,
    currentImport.module,
  );
  if (relevantImports.length > 0) {
    identicalImport = relevantImports[0]
      .getNamedImports()
      .filter(imp => imp.getName() === currentImport.name);
  }

  return identicalImport && identicalImport.length > 0;
};

exports.getNamedImportsFromModule = function(sourceFile, moduleName) {
  const allImports = sourceFile.getImportDeclarations();
  return allImports.filter(imp => imp.getModuleSpecifierValue() === moduleName);
};
