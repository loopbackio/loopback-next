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
    let path = this.artifactInfo.modelDir;
    let sourceModel = this.options.sourceModel;
    let targetModel = this.options.destinationModel;
    let relationType = this.options.relationType;
    let sourceModelPrimaryKey = this.options.foreignKey;
    let relationName = this.options.relationName;
    let fktype = this.options.foreignKeyType;

    // TOFO fix keyTppe and Foreignkey
    // add keyTo when needed in both hasMany and belongsTo relation
    let sourceModelPrimaryKeyType = 'number'
    let foreignKey = 'todoLId'

    let project = new ast.Project();


    const sourceFile = this.addFileToProject(
      project,
      path,
      utils.kebabCase(sourceModel),
    );

    const targetFile = this.addFileToProject(
      project,
      path,
      utils.kebabCase(targetModel),
    );

    const sourceClass = this.getClassObj(sourceFile, sourceModel);

    const targetClass = this.getClassObj(targetFile, targetModel);

    if (!this.isClassExist(sourceFile)) {
      return;
    }
    if (!this.isClassExist(targetFile)) {
      return;
    }

    let modelProperty;

    switch (relationType) {
      case 'hasMany':
        this.isRelationExist(sourceClass, relationName)
        if ((this.isForeignKeyExist(targetClass, foreignKey))) {
          this.vlidateType(targetClass, foreignKey, sourceModelPrimaryKeyType)
        }
        modelProperty = this.addForeginKey(foreignKey, sourceModelPrimaryKeyType)
        this.addPropertyToModel(targetClass, modelProperty);
        targetClass.formatText();
        targetFile.save();
        modelProperty = this.getHasMany(targetModel, relationName);
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
        this.isRelationExist(sourceClass, relationName)
        modelProperty = this.getBelongsTo(
          targetModel,
          relationName,
          utils.toClassName(sourceModelPrimaryKeyType),
        )
        break;
    }

    this.addPropertyToModel(sourceClass, modelProperty)
    this.addRequiredImports(sourceFile, targetModel, relationType, targetModel);
    sourceClass.formatText();
    sourceFile.save();
  }

  addFileToProject(project, path, modelName) {
    const fileName = path + '/' + modelName + '.model.ts';
    return project.addExistingSourceFile(fileName);
  }

  addPropertyToModel(classOBj, modelProperty) {
    classOBj.insertProperty(
      this.getPropertiesCount(classOBj),
      modelProperty,
    );
    classOBj.insertText(this.getPropertyStartPos(classOBj), '\n');
  }


  vlidateType(classObj, foriegnKeyName, foriegnKeyType) {
    if ((classObj.getProperty(foriegnKeyName).getType().getText()) != foriegnKeyType) {
      console.log(' foreignKey type has wrong Type ');
      throw new Error('foreginKey Type Error');
    }
    return

  }
  isDefaultForeignKey(classObj, sourceModelPrimaryKey, foreignKey) {
    let defaultForeignKey = utils.camelCase(classObj.getName()) + utils.toClassName(sourceModelPrimaryKey)
    if (defaultForeignKey === foreignKey) {
      console.log('default foreignKey is missing in the target model');
      throw new Error(' missing foreginKey');
    }
    return
  }

  isPropertyExist(classObj, propertyName) {
    return this.getClassProperties(classObj)
      .map(x => x.getName())
      .includes(propertyName);
  }

  isRelationExist(classObj, propertyName) {
    if (this.isForeignKeyExist(classObj, propertyName)) {
      console.log('property ' + propertyName + ' exsist in the model');
      throw new Error(' Property exsists');
    }
    return
  }


  isForeignKeyExist(classObj, foreignKey) {
    return this.isPropertyExist(classObj, foreignKey)
  }

  getType(classObj, propertyName) {
    return classObj
      .getProperty(propertyName)
      .getType()
      .getText();
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

  getClassesCount(fileName) {
    return fileName.getClasses().length;
  }

  getClassObj(fileName, modelName) {
    return fileName.getClassOrThrow(modelName);
  }

  isClassExist(fileName) {
    return this.getClassesCount(fileName) == 1;
  }

  addForeginKey(foreginKey, sourceModelPrimaryKeyType) {
    let fkProperty = {
      decorators: [{ name: 'property', arguments: ["{\n type : '" + sourceModelPrimaryKeyType + "',\n}"] }],
      name: foreginKey + '?',
      type: sourceModelPrimaryKeyType,
    };
    return fkProperty;
  }

  getHasMany(className, relationName) {
    let relationProperty = {
      decorators: [{ name: 'hasMany', arguments: ['() => ' + className] }],
      name: relationName,
      type: className + '[]',
    };

    return relationProperty;
  }

  getHasOne(className, relationName) {
    let relationProperty = {
      decorators: [{ name: 'hasOne', arguments: ['() => ' + className] }],
      name: relationName,
      type: className,
    };
    return relationProperty;
  }

  getBelongsTo(className, relationName, fktype) {
    let relationProperty;
    relationProperty = {
      decorators: [{ name: 'belongsTo', arguments: ['() => ' + className] }],
      name: relationName,
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
        module: './' + utils.kebabCase(targetModel) + '.model',
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
