// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const debug = require('./debug')('discover-relations');
const path = require('path');
const fs = require('fs');
const ast = require('ts-morph');
const utils = require('./utils');

function getSourceFile(project, filePath) {
  return (
    project.getSourceFile(filePath) ||
    (fs.existsSync(filePath)
      ? project.addSourceFileAtPath(filePath)
      : undefined)
  );
}

function addNamedImports(sourceFile, moduleName, names) {
  const declaration = sourceFile.getImportDeclaration(
    item => item.getModuleSpecifierValue() === moduleName,
  );

  if (!declaration) {
    sourceFile.addImportDeclaration({
      moduleSpecifier: moduleName,
      namedImports: [...new Set(names)],
    });
    return;
  }

  const existingNames = new Set(
    declaration.getNamedImports().map(item => item.getName()),
  );

  for (const name of names) {
    if (name && !existingNames.has(name)) {
      declaration.addNamedImport(name);
      existingNames.add(name);
    }
  }
}

function getRelationName(relation, usedNames) {
  const {sourceModel, targetModel, name, foreignKeyName} = relation;
  const relationName = utils.camelCase(name || sourceModel + targetModel);

  if (!usedNames.has(relationName)) {
    usedNames.add(relationName);
    return relationName;
  }

  const suffix = foreignKeyName || utils.camelCase(targetModel) || 'relation';
  let candidate = utils.camelCase(`${relationName}_${suffix}`);
  let counter = 2;

  while (usedNames.has(candidate)) {
    candidate = utils.camelCase(`${relationName}_${suffix}_${counter}`);
    counter++;
  }

  usedNames.add(candidate);
  return candidate;
}

function addModelRelation(project, projectRoot, relation, relationName) {
  const {sourceModel, targetModel, type, foreignKeyName} = relation;

  const sourceClassName = utils.toClassName(sourceModel);
  const targetClassName = utils.toClassName(targetModel);
  const modelFilePath = path.join(
    projectRoot,
    'src',
    'models',
    `${utils.kebabCase(sourceModel)}.model.ts`,
  );
  const modelFile = getSourceFile(project, modelFilePath);

  if (!modelFile) return;

  addNamedImports(modelFile, '@loopback/repository', [type]);

  if (sourceModel !== targetModel) {
    addNamedImports(modelFile, '.', [targetClassName]);
  }

  const modelClass = modelFile.getClass(sourceClassName);
  if (!modelClass) return;

  // belongsTo uses the existing foreign-key property. Other relations get
  // their own virtual property on the source model.
  const propertyName =
    type === 'belongsTo' && foreignKeyName ? foreignKeyName : relationName;
  const existingProperty = modelClass.getProperty(propertyName);
  const relationConfig = {name: relationName};

  if ((type === 'hasMany' || type === 'hasOne') && foreignKeyName) {
    relationConfig.keyTo = foreignKeyName;
  }

  const decoratorArguments = [`() => ${targetClassName}`];

  if (existingProperty && type === 'belongsTo') {
    if (existingProperty.getDecorator(type)) return;

    const propertyDecorator = existingProperty.getDecorator('property');
    let propertyDefinition;

    if (propertyDecorator) {
      const args = propertyDecorator.getArguments();
      propertyDefinition = args.length ? args[0].getText() : undefined;
      propertyDecorator.remove();
    }

    decoratorArguments.push(
      utils.stringifyObject(relationConfig, {inlineCharacterLimit: Infinity}),
    );

    if (propertyDefinition) {
      decoratorArguments.push(propertyDefinition);
    }

    existingProperty.insertDecorator(0, {
      name: type,
      arguments: decoratorArguments,
    });
    return;
  }

  if (existingProperty) {
    // Do not add the same relation twice.
    if (existingProperty.getDecorator(type)) return;
    return;
  }

  decoratorArguments.push(
    utils.stringifyObject(relationConfig, {inlineCharacterLimit: Infinity}),
  );

  modelClass.addProperty({
    name: relationName,
    type: type === 'hasMany' ? `${targetClassName}[]` : targetClassName,
    decorators: [
      {
        name: type,
        arguments: decoratorArguments,
      },
    ],
    leadingTrivia: writer => writer.blankLine(),
  });
}

function addRepositoryRelation(project, projectRoot, relation, relationName) {
  const {
    sourceModel,
    targetModel,
    type,
    sourceModelIdProperty: idProperty,
  } = relation;

  const sourceClassName = utils.toClassName(sourceModel);
  const targetClassName = utils.toClassName(targetModel);
  const sourceFileName = utils.kebabCase(sourceModel);
  const targetFileName = utils.kebabCase(targetModel);
  const repoFilePath = path.join(
    projectRoot,
    'src',
    'repositories',
    `${sourceFileName}.repository.ts`,
  );
  const repoFile = getSourceFile(project, repoFilePath);

  if (!repoFile) return;

  const repoClass = repoFile.getClass(`${sourceClassName}Repository`);
  if (!repoClass) return;

  const targetRepoName = `${targetClassName}Repository`;
  const targetRepoParamName = `${utils.camelCase(targetModel)}RepositoryGetter`;
  const targetRepoImportPath = `./${targetFileName}.repository`;

  addNamedImports(repoFile, '@loopback/core', ['Getter']);
  addNamedImports(repoFile, '@loopback/repository', ['repository']);

  if (sourceModel !== targetModel) {
    addNamedImports(repoFile, targetRepoImportPath, [targetRepoName]);
    addNamedImports(repoFile, '../models', [targetClassName]);
  }

  const constructor = repoClass.getConstructors()[0];
  if (!constructor) {
    debug(`Skipping ${sourceClassName}Repository: no constructor found.`);
    return;
  }

  const hasGetter = constructor
    .getParameters()
    .some(parameter => parameter.getName() === targetRepoParamName);

  if (!hasGetter) {
    constructor.addParameter({
      name: targetRepoParamName,
      type: `Getter<${targetRepoName}>`,
      decorators: [
        {
          name: 'repository.getter',
          arguments: [`'${targetRepoName}'`],
        },
      ],
    });
  }

  const factoryMethod =
    type === 'hasMany'
      ? 'createHasManyRepositoryFactoryFor'
      : type === 'hasOne'
        ? 'createHasOneRepositoryFactoryFor'
        : 'createBelongsToAccessorFor';

  const constructorBody = constructor.getBody();
  if (!constructorBody) return;

  const initialization = `this.${relationName} = this.${factoryMethod}('${relationName}', ${targetRepoParamName});`;
  const inclusionResolver = `this.registerInclusionResolver('${relationName}', this.${relationName}.inclusionResolver);`;
  const bodyText = constructorBody.getText();

  if (!bodyText.includes(initialization)) {
    constructor.addStatements(initialization);
  }

  if (!bodyText.includes(inclusionResolver)) {
    constructor.addStatements(inclusionResolver);
  }

  if (repoClass.getProperty(relationName)) return;

  const accessorType =
    type === 'hasMany'
      ? 'HasManyRepositoryFactory'
      : type === 'hasOne'
        ? 'HasOneRepositoryFactory'
        : 'BelongsToAccessor';

  addNamedImports(repoFile, '@loopback/repository', [accessorType]);

  if (!idProperty || !idProperty.name) {
    debug(
      `Skipping accessor property ${relationName}: source model primary key is missing.`,
    );
    return;
  }

  repoClass.addProperty({
    name: relationName,
    isReadonly: true,
    scope: 'public',
    type: `${accessorType}<${targetClassName}, typeof ${sourceClassName}.prototype.${idProperty.name}>`,
    leadingTrivia: writer => writer.blankLine(),
  });
}

function addControllerImports(controllerFile, sourceModel, targetModel) {
  const sourceClassName = utils.toClassName(sourceModel);
  const targetClassName = utils.toClassName(targetModel);
  const sourceRepoName = `${sourceClassName}Repository`;
  const targetRepoName = `${targetClassName}Repository`;

  addNamedImports(controllerFile, '@loopback/repository', [
    'repository',
    'Filter',
  ]);
  addNamedImports(controllerFile, '@loopback/rest', [
    'get',
    'param',
    'getModelSchemaRef',
  ]);
  addNamedImports(
    controllerFile,
    '../models',
    sourceModel === targetModel
      ? [sourceClassName]
      : [sourceClassName, targetClassName],
  );
  addNamedImports(controllerFile, '../repositories', [
    ...new Set([sourceRepoName, targetRepoName]),
  ]);
}

function addControllerMethod(controllerClass, relation, relationName) {
  const {
    sourceModel,
    targetModel,
    type,
    sourceModelIdProperty: idProperty,
  } = relation;

  if (!idProperty || !idProperty.name || !idProperty.type) {
    debug(
      `Skipping controller method for ${sourceModel} -> ${targetModel}: source model primary key is missing.`,
    );
    return;
  }

  const sourceClassName = utils.toClassName(sourceModel);
  const targetClassName = utils.toClassName(targetModel);
  const sourceRepoParam = `${utils.camelCase(sourceClassName)}Repository`;
  const routeBase = `/${utils.kebabCase(utils.pluralize(sourceModel))}/{id}`;
  const targetPath = utils.kebabCase(targetModel);
  const idType = `typeof ${sourceClassName}.prototype.${idProperty.name}`;
  const idParameter = {
    name: 'id',
    type: idType,
    decorators: [
      {
        name: `param.path.${idProperty.type}`,
        arguments: ["'id'"],
      },
    ],
  };

  if (type === 'hasMany') {
    const routePath = `${routeBase}/${targetPath}${utils.pluralize(targetPath)}`;
    const methodName = `find${targetClassName}${utils.pluralize(targetPath)}`;

    if (controllerClass.getMethod(methodName)) return;

    const response = `{
      responses: {
        '200': {
          description: 'Array of ${targetClassName} instances belonging to ${sourceClassName}',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: getModelSchemaRef(${targetClassName}, {includeRelations: true}),
              },
            },
          },
        },
      },
    }`;

    controllerClass.addMethod({
      name: methodName,
      returnType: `Promise<${targetClassName}[]>`,
      decorators: [{name: 'get', arguments: [`'${routePath}'`, response]}],
      isAsync: true,
      parameters: [
        idParameter,
        {
          name: 'filter',
          type: `Filter<${targetClassName}>`,
          decorators: [
            {
              name: 'param.filter',
              arguments: [targetClassName],
            },
          ],
        },
      ],
      statements: [
        `return this.${sourceRepoParam}.${relationName}(id).find(filter);`,
      ],
    });
    return;
  }

  if (type !== 'belongsTo' && type !== 'hasOne') return;

  const methodName = `get${targetClassName}`;
  if (controllerClass.getMethod(methodName)) return;

  const routePath = `${routeBase}/${targetPath}`;
  const response = `{
    responses: {
      '200': {
        description: '${targetClassName} belonging to ${sourceClassName}',
        content: {
          'application/json': {
            schema: getModelSchemaRef(${targetClassName}),
          },
        },
      },
    },
  }`;
  const statement =
    type === 'hasOne'
      ? `return this.${sourceRepoParam}.${relationName}(id).get();`
      : `return this.${sourceRepoParam}.${relationName}(id);`;

  controllerClass.addMethod({
    name: methodName,
    isAsync: true,
    returnType: `Promise<${targetClassName}>`,
    decorators: [{name: 'get', arguments: [`'${routePath}'`, response]}],
    parameters: [idParameter],
    statements: [statement],
  });
}

function addRelationController(project, projectRoot, relation, relationName) {
  const {sourceModel, targetModel} = relation;
  const sourceFileName = utils.kebabCase(sourceModel);
  const targetFileName = utils.kebabCase(targetModel);
  const controllerPath = path.join(
    projectRoot,
    'src',
    'controllers',
    `${sourceFileName}-${targetFileName}.controller.ts`,
  );

  let controllerFile = getSourceFile(project, controllerPath);
  if (!controllerFile) {
    controllerFile = project.createSourceFile(controllerPath, '');
  }

  addControllerImports(controllerFile, sourceModel, targetModel);

  const sourceClassName = utils.toClassName(sourceModel);
  const targetClassName = utils.toClassName(targetModel);
  const controllerClassName = `${sourceClassName}${targetClassName}Controller`;
  let controllerClass = controllerFile.getClass(controllerClassName);

  if (!controllerClass) {
    controllerClass = controllerFile.addClass({
      name: controllerClassName,
      isExported: true,
    });

    const sourceRepoName = `${sourceClassName}Repository`;
    const sourceRepoParam = `${utils.camelCase(sourceClassName)}Repository`;

    controllerClass.addConstructor({
      parameters: [
        {
          name: sourceRepoParam,
          type: sourceRepoName,
          decorators: [
            {
              name: 'repository',
              arguments: [sourceRepoName],
            },
          ],
          scope: 'public',
        },
      ],
    });
  }

  addControllerMethod(controllerClass, relation, relationName);
  controllerFile.formatText();
}

/**
 * Updates model and repository files, then generates relation controllers.
 *
 * @param {Array<Object>} relations Relation configuration objects.
 * @param {string} projectRoot Application project directory.
 * @returns {Promise<void>}
 */
async function discoverRelations(relations, projectRoot) {
  if (!Array.isArray(relations) || relations.length === 0) {
    debug('No relations provided for discovery.');
    return;
  }

  debug(`Processing ${relations.length} relations`);

  const tsConfigPath = path.join(projectRoot, 'tsconfig.json');
  const hasTsConfig = fs.existsSync(tsConfigPath);
  const astConfigs = {
    manipulationSettings: {
      indentationText: ast.IndentationText.TwoSpaces,
      insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: false,
      newLineKind: ast.NewLineKind.LineFeed,
      quoteKind: ast.QuoteKind.Single,
    },
  };
  if (hasTsConfig) {
    astConfigs.tsConfigFilePath = path.join(projectRoot, 'tsconfig.json');
  }
  const project = new ast.Project(astConfigs);
  if (!hasTsConfig) {
    project.addSourceFilesAtPaths(path.join(projectRoot, 'src/models/**/*.ts'));
  }

  const usedRelationNames = new Map();

  for (const relation of relations) {
    if (!relation) continue;

    const {sourceModel, targetModel, type} = relation;
    if (!sourceModel || !targetModel || !type) continue;
    if (!['belongsTo', 'hasOne', 'hasMany'].includes(type)) {
      debug(`Skipping unsupported relation type: ${type}`);
      continue;
    }

    // Keep relation names unique within each source model.
    if (!usedRelationNames.has(sourceModel)) {
      usedRelationNames.set(sourceModel, new Set());
    }

    const relationName = getRelationName(
      relation,
      usedRelationNames.get(sourceModel),
    );

    debug(
      `Processing ${type} relation from ${sourceModel} to ${targetModel} (${relationName})`,
    );

    addModelRelation(project, projectRoot, relation, relationName);
    addRepositoryRelation(project, projectRoot, relation, relationName);
    addRelationController(project, projectRoot, relation, relationName);
  }

  await project.save();

  debug(
    'Models, repositories, relations, and controllers generated and saved successfully.',
  );
}

module.exports = {
  discoverRelations,
};
