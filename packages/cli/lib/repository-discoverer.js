// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const debug = require('./debug')('discover-repositories');
const g = require('./globalize');
const chalk = require('chalk');
const path = require('path');
const utils = require('./utils');
const ast = require('ts-morph');
/**
 * Programmatically generates repository files and updates index exports for discovered models
 * using ts-morph.
 *
 * @param {Object} repositoryOptions Options object containing datasource, repositoryBaseClass, and repositories.
 * @returns {Promise<void>}
 */
async function discoverRepositories(repositoryOptions, projectRoot) {
  const {datasource, repositoryBaseClass, repositories} = repositoryOptions;
  const modelList = Array.from(repositories || []);

  if (!modelList.length) {
    debug('No models provided for repository discovery.');
    console.log(
      chalk.yellow(g.f('No models provided for repository discovery.')),
    );
    return;
  }

  debug(
    `Discovering and generating repositories for ${modelList.length} models`,
  );
  console.log(
    chalk.green(
      g.f(
        'Discovering and generating repositories for %d models',
        modelList.length,
      ),
    ),
  );

  // Create an AST project
  const project = new ast.Project({
    manipulationSettings: {
      indentationText: ast.IndentationText.TwoSpaces,
      insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: false,
      newLineKind: ast.NewLineKind.LineFeed,
      quoteKind: ast.QuoteKind.Single,
      tsConfigFilePath: path.join(projectRoot, 'tsconfig.json'),
    },
  });

  const baseClass = repositoryBaseClass || 'DefaultCrudRepository';
  const dsClassName = utils.toClassName(datasource) + 'DataSource';
  for (const model of modelList) {
    const modelClassName = utils.toClassName(model);
    const modelFileName = utils.kebabCase(model);
    const repoClassName = `${modelClassName}Repository`;
    const repoFileName = `${modelFileName}.repository.ts`;
    const repoFilePath = path.join(
      projectRoot,
      'src',
      'repositories',
      repoFileName,
    );

    debug(`Generating repository file for model: ${model} -> ${repoFilePath}`);
    console.log(
      chalk.cyan(
        g.f(
          'Generating repository file for model: %s -> %s',
          model,
          repoFilePath,
        ),
      ),
    );

    let repoFile = project.getSourceFile(repoFilePath);
    if (!repoFile) {
      repoFile = project.createSourceFile(repoFilePath, '', {overwrite: true});
    } else {
      repoFile.removeText();
    }

    repoFile.addImportDeclarations([
      {moduleSpecifier: '@loopback/core', namedImports: ['inject']},
      {moduleSpecifier: '@loopback/repository', namedImports: [baseClass]},
      {moduleSpecifier: '../datasources', namedImports: [dsClassName]},
      {
        moduleSpecifier: '../models',
        namedImports: [modelClassName, `${modelClassName}Relations`],
      },
    ]);

    const repoClass = repoFile.addClass({
      name: repoClassName,
      extends: `${baseClass}<${modelClassName}, typeof ${modelClassName}.prototype.id, ${modelClassName}Relations>`,
      isExported: true,
    });

    repoClass.addConstructor({
      parameters: [
        {
          name: 'dataSource',
          type: dsClassName,
          decorators: [
            {
              name: 'inject',
              arguments: [`'datasources.${datasource}'`],
            },
          ],
        },
      ],
      statements: [`super(${modelClassName}, dataSource);`],
    });
  }

  // Update repositories/index.ts exports
  const indexFilePath = path.join(
    projectRoot,
    'src',
    'repositories',
    'index.ts',
  );
  let indexFile = project.getSourceFile(indexFilePath);
  if (!indexFile) {
    indexFile = project.createSourceFile(indexFilePath, '', {overwrite: true});
  }
  for (const model of modelList) {
    const modelFileName = utils.kebabCase(model);
    const exportStmt = `export * from './${modelFileName}.repository';`;
    const fullText = indexFile.getFullText();
    if (!fullText.includes(exportStmt)) {
      indexFile.addExportDeclaration({
        moduleSpecifier: `./${modelFileName}.repository`,
      });
    }
  }

  await project.save();
  debug('Repositories generated and saved successfully.');
  console.log(
    chalk.green(g.f('Repositories generated and saved successfully.')),
  );
}

module.exports = {
  discoverRepositories,
};
