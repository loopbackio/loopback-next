const ArtifactGenerator = require('../../lib/artifact-generator');

const ast = require('ts-simple-ast');
const path = require('path');
const utils = require('../../lib/utils');
const relationUtils = require('./relationutils');

module.exports = class RepositoryRelation extends ArtifactGenerator {
  constructor(args, opts) {
    super(args, opts);
  }

  _setupGenerator() {
    super._setupGenerator();

    this.artifactInfo = {
      type: 'relation',
      rootDir: utils.sourceRootDir,
    };
    this.artifactInfo.repositoriesDir = path.resolve(
      this.artifactInfo.rootDir,
      'repositories',
    );
    this.artifactInfo.modelsDir = path.resolve(
      this.artifactInfo.rootDir,
      'models',
    );
  }

  generateRelationRepository(
    sourceModel,
    targetModel,
    foreignKey,
    relationName,
  ) {
    this.initializeProperties(sourceModel, targetModel, relationName);
    this.handleImports();
    this.handleProperties();
    this.handleConstructor();
    this.artifactInfo.srcRepositoryFile.save();
  }

  initializeProperties(sourceModel, targetModel, relationName) {
    this.artifactInfo.srcModelFile = path.resolve(
      this.artifactInfo.modelsDir,
      sourceModel + '.model.ts',
    );

    this.artifactInfo.dstModelFile = path.resolve(
      this.artifactInfo.modelsDir,
      targetModel + '.model.ts',
    );

    this.artifactInfo.srcModelClass = this.getClassName(
      this.artifactInfo.srcModelFile,
    );

    this.artifactInfo.dstModelClass = this.getClassName(
      this.artifactInfo.dstModelFile,
    );

    this.artifactInfo.srcRepositoryFile = path.resolve(
      this.artifactInfo.repositoriesDir,
      sourceModel + '.repository.ts',
    );

    this.artifactInfo.dstRepositoryFile = path.resolve(
      this.artifactInfo.repositoriesDir,
      targetModel + '.repository.ts',
    );

    this.artifactInfo.srcRepositoryClassName = this.getClassName(
      this.artifactInfo.srcRepositoryFile,
    );

    this.artifactInfo.dstRepositoryClassName = this.getClassName(
      this.artifactInfo.dstRepositoryFile,
    );

    this.artifactInfo.relationName = relationName;

    this.artifactInfo.relationProperty = {
      name: this.getRelationPropertyName(),
      type: this.getRelationPropertyType(),
    };

    this.artifactInfo.srcRepositoryFile = new ast.Project().addExistingSourceFile(
      this.artifactInfo.srcRepositoryFile,
    );
  }

  getRelationPropertyName() {
    let propertyName = this.artifactInfo.dstModelClass[0].toLowerCase();
    propertyName += this.artifactInfo.dstModelClass.substring(1);

    if (this.artifactInfo.relationName == relationUtils.relationType.hasMany) {
      propertyName += 's';
    }
    return propertyName;
  }

  getRelationPropertyType() {
    let propertyType = this.capitalizeFirstLetter(
      this.artifactInfo.relationName,
    );
    if (
      this.artifactInfo.relationName == relationUtils.relationType.belongsTo
    ) {
      propertyType += 'Accessor';
    } else if (
      this.artifactInfo.relationName == relationType.hasOne ||
      this.artifactInfo.relationName == relationUtils.relationType.hasMany
    ) {
      propertyType += 'RepositoryFactory';
    } else {
      throw Error('relation is invalid');
    }
    propertyType =
      propertyType +
      '<' +
      this.capitalizeFirstLetter(this.artifactInfo.dstModelClass) +
      ', typeof ' +
      this.capitalizeFirstLetter(this.artifactInfo.srcModelClass) +
      '.prototype.id>';

    return propertyType;
  }

  getClassName(fileName) {
    let sourceFile = new ast.Project().addExistingSourceFile(fileName);
    let className = sourceFile.getClasses()[0].getNameOrThrow();
    return className;
  }

  handleImports() {
    let requierdImports = this.getRequiredImports();
    this.addRequiredImports(requierdImports);
  }

  getRequiredImports() {
    let importsArray = [
      {
        name: this.artifactInfo.dstModelClass,
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
        name: this.artifactInfo.dstRepositoryClassName,
        module: './index',
      },
    ];

    let RelationName = this.capitalizeFirstLetter(
      this.artifactInfo.relationName,
    );
    switch (this.artifactInfo.relationName) {
      case relationType.hasMany:
        importsArray.push({
          name: RelationName + 'RepositoryFactory',
          module: '@loopback/repository',
        });
        break;
      case relationType.hasOne:
        importsArray.push({
          name: RelationName + 'RepositoryFactory',
          module: '@loopback/repository',
        });
        break;

      case relationType.belongsTo:
        importsArray.push({
          name: RelationName + 'Accessor',
          module: '@loopback/repository',
        });
        break;

      default:
        result = false;
    }

    return importsArray;
  }

  addRequiredImports(requiredImports) {
    for (let currentImport of requiredImports) {
      this.addImport(currentImport, this.artifactInfo.srcRepositoryFile);
    }
  }

  addImport(requiredImport) {
    if (!this.doesModuleExist(requiredImport)) {
      this.addImportWithNonExistingModule(requiredImport);
    } else {
      this.addImportsWithExistingModule(requiredImport);
    }
  }

  addImportWithNonExistingModule(requiredImport) {
    this.artifactInfo.srcRepositoryFile.addImportDeclaration({
      moduleSpecifier: requiredImport.module,
      namedImports: [requiredImport.name],
    });
  }

  addImportsWithExistingModule(requiredImport) {
    let moduleName = requiredImport.module;
    let importDeclcaration = this.artifactInfo.srcRepositoryFile.getImportDeclarationOrThrow(
      moduleName,
    );
    if (!this.doesImportExist(importDeclcaration, requiredImport.name)) {
      importDeclcaration.addNamedImport(requiredImport.name);
    }
  }

  doesImportExist(importDelcaration, importName) {
    let allNamedImports = importDelcaration.getNamedImports();
    for (let currentNamedImport of allNamedImports) {
      if (currentNamedImport.getName() == importName) {
        return true;
      }
    }
    return false;
  }

  doesModuleExist(importDeclaration) {
    let moduleName = importDeclaration.module;
    let relevantImport = this.artifactInfo.srcRepositoryFile.getImportDeclaration(
      moduleName,
    );
    return relevantImport != undefined;
  }

  handleProperties() {
    let classDeclaration = this.artifactInfo.srcRepositoryFile.getClassOrThrow(
      this.artifactInfo.srcRepositoryClassName,
    );

    this.addProperty(classDeclaration);

    this.orderProperties(classDeclaration);
  }

  addProperty(classDeclaration) {
    classDeclaration.addProperty({
      scope: ast.Scope.Public,
      isReadonly: true,
      name: this.artifactInfo.relationProperty.name,
      type: this.artifactInfo.relationProperty.type,
    });
  }

  orderProperties(classDeclaration) {
    classDeclaration.getProperties().forEach(function(currentProperty) {
      currentProperty.setOrder(0);
    });
  }

  handleConstructor() {
    let classDeclaration = this.artifactInfo.srcRepositoryFile.getClassOrThrow(
      this.artifactInfo.srcRepositoryClassName,
    );
    let classConstructor = classDeclaration.getConstructors()[0];

    this.addParameters(classConstructor);

    this.addCreator(classConstructor);
  }

  addParameters(classConstructor) {
    classConstructor.addParameter({
      decorators: [
        {
          name: 'repository.getter',
          arguments: ["'" + this.artifactInfo.dstRepositoryClassName + "'"],
        },
      ],
      name:
        this.regularizeFirstLetter(this.artifactInfo.dstRepositoryClassName) +
        'Getter',
      type: 'Getter<' + this.artifactInfo.dstRepositoryClassName + '>,',
      scope: ast.Scope.Protected,
    });
  }

  addCreator(classConstructor) {
    let statement =
      'this.create' +
      this.capitalizeFirstLetter(this.artifactInfo.relationName);
    if (this.artifactInfo.relationName == relationType.belongsTo) {
      statement += 'Accessor';
    } else if (
      this.artifactInfo.relationName == relationType.hasMany ||
      this.artifactInfo.relationName == relationType.hasOne
    ) {
      statement += 'RepositoryFactory';
    } else {
      throw Error('relation is invalid');
    }
    statement += 'For(';

    let parameter1 = "'" + this.artifactInfo.relationProperty.name + "',";
    let paramater2 =
      this.regularizeFirstLetter(this.artifactInfo.dstRepositoryClassName) +
      'Getter,';

    statement =
      'this.' +
      this.artifactInfo.relationProperty.name +
      '=' +
      statement +
      parameter1 +
      paramater2 +
      ');';

    classConstructor.insertStatements(1, statement);
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  regularizeFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
  }
};
