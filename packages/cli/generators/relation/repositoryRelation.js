const ArtifactGenerator = require('../../lib/artifact-generator');
const debug = require('../../lib/debug')('relation-generator');
const inspect = require('util').inspect;
const path = require('path');
const chalk = require('chalk');
const utils = require('../../lib/utils');

const fs = require('fs');
const ast = require('ts-simple-ast');

const relationType = {
  hasOne: 'hasOne',
  hasMany: 'hasMany',
  belongsTo: 'belongsTo',
};

module.exports = class RepositoryRelation extends ArtifactGenerator {
  _setupGenerator() {
    super._setupGenerator();
    this.artifactInfo = {
      type: 'relation',
      rootDir: utils.sourceRootDir,
    };

    this.artifactInfo.repositoryDir = path.resolve(
      this.artifactInfo.rootDir,
      'repositories',
    );
  }

  generateRelationRepository(
    sourceModel,
    targetModel,
    foreignKey,
    relationName,
  ) {
    let result;

    let projectPath = this.artifactInfo.repositoryDir;

    if (!this.doesRepositoryExists(projectPath, sourceModel)) {
      throw Error("repository for source model doesn't exist");
    }
    if (!doesRepositoryExists(projectPath, targetModel)) {
      throw Error("repository for target model doesn't exist");
    }
    if (
      relationName != relationType.hasOne &&
      relationName != relationType.hasMany &&
      relationName != relationType.belongsTo
    ) {
      throw Error('relation is invalid');
    }

    generateRelation(projectPath, sourceModel, targetModel, relationName);
  }

  doesRepositoryExists(path, model) {
    let tempPath = path + '/src/repositories/' + model + '.repository.ts';
    let result = fs.existsSync(tempPath);
    return result;
  }

  generateRelation(projectPath, sourceModel, targetModel, relationName) {
    let sourceFile = initiateSourceFile(projectPath, sourceModel);
    addRequiredImports(sourceFile, targetModel, relationName);
    addRequiredProperties(sourceFile, sourceModel, targetModel, relationName);
    editConstructor(sourceFile, sourceModel, targetModel, relationName);
    sourceFile.save();
  }

  initiateSourceFile(basePath, modelName) {
    let repoPath = createRepositoryPath(basePath, modelName);
    let project = new ast.Project();
    let sourceFile = project.addExistingSourceFile(repoPath);

    return sourceFile;
  }

  createRepositoryPath(basePath, modelName) {
    return basePath + '/src/repositories/' + modelName + '.repository.ts';
  }

  addRequiredImports(sourceFile, targetModel, relationName) {
    let importsArray = getRequiredImports(targetModel, relationName);
    while (importsArray.length > 0) {
      let currentImport = importsArray.pop();
      addCurrentImport(sourceFile, currentImport);
    }
  }

  getRequiredImports(targetModel, relationName) {
    let capRelationName = capitalizeFirstLetter(relationName);

    let importsArray = getSharedImports(targetModel);

    switch (relationName) {
      case relationType.hasMany:
        importsArray.push({
          name: capRelationName + 'RepositoryFactory',
          module: '@loopback/repository',
        });
        break;

      case relationType.hasOne:
        importsArray.push({
          name: capRelationName + 'RepositoryFactory',
          module: '@loopback/repository',
        });
        break;

      case relationType.belongsTo:
        importsArray.push({
          name: capRelationName + 'Accessor',
          module: '@loopback/repository',
        });
        break;

      default:
        result = false;
    }

    return importsArray;
  }

  getSharedImports(targetModel) {
    let capTargetModel = capitalizeFirstLetter(targetModel);
    let importsArray = [
      {
        name: capTargetModel,
        module: '../models',
      },
      {
        name: capTargetModel + 'Repository',
        module: './index',
      },
      {
        name: 'repository',
        module: '@loopback/repository',
      },
      {
        name: 'Getter',
        module: '@loopback/core',
      },
    ];
    return importsArray;
  }

  addCurrentImport(sourceFile, currentImport) {
    if (!doesModuleExists(sourceFile, currentImport.module)) {
      sourceFile.addImportDeclaration({
        moduleSpecifier: currentImport.module,
      });
    }
    if (!doesImportExistInModule(sourceFile, currentImport)) {
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
    let relevantImports = getNamedImportsFromModule(
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

  capitalizeFirstLetter(string) {
    string = string[0].toUpperCase() + string.substring(1);
    return string;
  }

  addRequiredProperties(sourceFile, sourceModel, targetModel, relationName) {
    let classDeclaration = sourceFile.getClassOrThrow(
      capitalizeFirstLetter(sourceModel) + 'Repository',
    );
    classDeclaration.addProperty({
      scope: ast.Scope.Public,
      isReadonly: true,
      name: getTargetPropertyName(targetModel, relationName),
      type: getTargetPropertyType(sourceModel, targetModel, relationName),
    });
    orderProperties(classDeclaration);
  }

  getTargetPropertyName(targetModel, relationName) {
    let propertyName = targetModel[0].toLowerCase();
    propertyName += targetModel.substring(1);

    if (relationName == relationType.hasMany) {
      propertyName += 's';
    }
    return propertyName;
  }

  getTargetPropertyType(sourceModel, targetModel, relationName) {
    let propertyType = capitalizeFirstLetter(relationName);
    if (relationName == relationType.belongsTo) {
      propertyType += 'Accessor';
    } else if (
      relationName == relationType.hasOne ||
      relationName == relationType.hasMany
    ) {
      propertyType += 'RepositoryFactory';
    } else {
      throw Error('relation is invalid');
    }
    propertyType +=
      '<' +
      capitalizeFirstLetter(targetModel) +
      ', typeof ' +
      capitalizeFirstLetter(sourceModel) +
      '.prototype.id>';

    return propertyType;
  }

  orderProperties(classDeclaration) {
    classDeclaration.getProperties().forEach(function(currentProperty) {
      currentProperty.setOrder(0);
    });
  }

  editConstructor(sourceFile, sourceModel, targetModel, relationName) {
    let capSourceModel = capitalizeFirstLetter(sourceModel);
    let classDeclaration = sourceFile.getClassOrThrow(
      capSourceModel + 'Repository',
    );
    let classConstructor = classDeclaration.getConstructors()[0];
    addParameters(classConstructor, targetModel);
    addCreator(classConstructor, targetModel, relationName);
  }

  addParameters(classConstructor, targetModel) {
    classConstructor.addParameter({
      decorators: [
        {
          name: 'repository.getter',
          arguments: ["'" + capitalizeFirstLetter(targetModel) + "Repository'"],
        },
      ],
      name: targetModel + 'RepositoryGetter',
      type: 'Getter<' + capitalizeFirstLetter(targetModel) + 'Repository>,',
    });
  }

  addCreator(classConstructor, targetModel, relationName) {
    var propertyName = getTargetPropertyName(targetModel, relationName);
    var method = 'this.create' + capitalizeFirstLetter(relationName);
    if (relationName == relationType.belongsTo) {
      method += 'Accessor';
    } else if (
      relationName == relationType.hasMany ||
      relationName == relationType.hasOne
    ) {
      method += 'RepositoryFactory';
    } else {
      throw Error('relation is invalid');
    }
    method += 'For(';

    var parameter1 = "'" + propertyName + "',";
    var paramater2 = 'get' + capitalizeFirstLetter(targetModel) + 'Repository,';

    let creatorStatement =
      'this.' + propertyName + '=' + method + parameter1 + paramater2 + ');';

    classConstructor.insertStatements(1, creatorStatement);
  }
};
