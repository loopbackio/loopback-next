// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const debug = require('./debug')('discover-repositories');
const path = require('path');
const ast = require('ts-morph');
const utils = require('./utils');
const fs = require('fs');

/**
 * Generates repository files for discovered models and updates index exports.
 *
 * Existing repository files are preserved. Missing imports and repository
 * classes are added without replacing existing code.
 *
 * @param {Object} repositoryOptions
 * @param {string} projectRoot
 * @returns {Promise<void>}
 */
async function discoverRepositories(repositoryOptions, projectRoot) {
  const {datasource, repositoryBaseClass, repositories} = repositoryOptions;
  const modelList = Array.from(repositories || []);

  if (!modelList.length) {
    debug('No models provided for repository discovery.');
    return;
  }

  debug(`Generating repositories for ${modelList.length} models`);
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

  const baseClass = repositoryBaseClass || 'DefaultCrudRepository';
  const dataSourceClass = utils.toClassName(datasource) + 'DataSource';

  for (const model of modelList) {
    const modelClass = utils.toClassName(model);
    const modelFile = utils.kebabCase(model);
    const repositoryClass = `${modelClass}Repository`;
    const repositoryPath = path.join(
      projectRoot,
      'src',
      'repositories',
      `${modelFile}.repository.ts`,
    );

    debug(`Generating repository for ${model}: ${repositoryPath}`);

    let sourceFile = project.getSourceFile(repositoryPath);

    if (!sourceFile) {
      sourceFile = project.createSourceFile(repositoryPath, '');
    }

    const imports = [
      {
        moduleSpecifier: '@loopback/core',
        namedImports: ['inject'],
      },
      {
        moduleSpecifier: '@loopback/repository',
        namedImports: [baseClass],
      },
      {
        moduleSpecifier: '../datasources',
        namedImports: [dataSourceClass],
      },
      {
        moduleSpecifier: '../models',
        namedImports: [modelClass, `${modelClass}Relations`],
      },
    ];

    for (const item of imports) {
      const existingImport = sourceFile.getImportDeclaration(
        item.moduleSpecifier,
      );

      if (!existingImport) {
        sourceFile.addImportDeclaration(item);
        continue;
      }

      for (const name of item.namedImports) {
        const alreadyImported = existingImport
          .getNamedImports()
          .some(importSpecifier => importSpecifier.getName() === name);

        if (!alreadyImported) {
          existingImport.addNamedImport(name);
        }
      }
    }

    const existingRepository = sourceFile.getClass(repositoryClass);

    if (!existingRepository) {
      const repository = sourceFile.addClass({
        name: repositoryClass,
        extends: `${baseClass}<${modelClass}, typeof ${modelClass}.prototype.id, ${modelClass}Relations>`,
        isExported: true,
      });

      repository.addConstructor({
        parameters: [
          {
            name: 'dataSource',
            type: dataSourceClass,
            decorators: [
              {
                name: 'inject',
                arguments: [`'datasources.${datasource}'`],
              },
            ],
          },
        ],
        statements: [`super(${modelClass}, dataSource);`],
      });
    }
  }

  // Update repositories/index.ts exports.
  const indexFilePath = path.join(
    projectRoot,
    'src',
    'repositories',
    'index.ts',
  );

  let indexFile = project.getSourceFile(indexFilePath);

  if (!indexFile) {
    indexFile = project.createSourceFile(indexFilePath, '');
  }

  for (const model of modelList) {
    const modelFile = utils.kebabCase(model);
    const moduleSpecifier = `./${modelFile}.repository`;

    const alreadyExported = indexFile
      .getExportDeclarations()
      .some(
        declaration =>
          declaration.getModuleSpecifierValue() === moduleSpecifier,
      );

    if (!alreadyExported) {
      indexFile.addExportDeclaration({
        moduleSpecifier,
      });
    }
  }

  await project.save();

  debug('Repositories generated and saved successfully.');
}

module.exports = {
  discoverRepositories,
};
