// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const debug = require('./debug')('discover-relations');
const chalk = require('chalk');
const g = require('./globalize');
const path = require('path');
const utils = require('./utils');
const ast = require('ts-morph');
const fs = require('fs');
/**
 * Programmatically modifies models, updates repositories (accessors & inclusion resolvers),
 * and generates relation controllers for hasMany, belongsTo, and hasOne using ts-morph.
 *
 * @param {Array<Object>} relations Array of relation configuration objects.
 * @returns {Promise<void>}
 */
async function discoverRelations(relations, projectRoot) {
  if (!relations || !relations.length) {
    debug('No relations provided for discovery.');
    console.log(chalk.yellow(g.f('No relations provided for discovery.')));
    return;
  }

  debug(`Processing ${relations.length} relations`);
  console.log(
    chalk.green(
      g.f('Processing relation discovery for %d relations', relations.length),
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

  for (const rel of relations) {
    const {sourceModel, targetModel, name, type, foreignKeyName} = rel;
    const relationName = name || foreignKeyName + targetModel;
    if (!sourceModel || !targetModel || !type) {
      continue;
    }

    const sourceClassName = utils.toClassName(sourceModel);
    const targetClassName = utils.toClassName(targetModel);
    const sourceFileName = utils.kebabCase(sourceModel);
    const targetFileName = utils.kebabCase(targetModel);

    // If a foreignKeyName exists and matches an existing property, use it as the property name.
    // Otherwise, fall back to explicit name, or pluralize for hasMany / singularize for others.
    const targetPropName =
      foreignKeyName ||
      name ||
      (type === 'hasMany'
        ? utils.camelCase(targetModel) + 's'
        : utils.camelCase(targetModel));

    debug(
      `Processing relation ${type} from ${sourceModel} to ${targetModel} (property: ${targetPropName})`,
    );
    console.log(
      chalk.cyan(
        g.f(
          'Processing relation %s from %s to %s (property: %s)',
          type,
          sourceModel,
          targetModel,
          targetPropName,
        ),
      ),
    );

    // 1. Modify Source Model File (add/update decorator, foreignKey options, and imports)
    const modelFilePath = path.join(
      projectRoot,
      'src',
      'models',
      `${sourceFileName}.model.ts`,
    );
    if (fs.existsSync(modelFilePath)) {
      project.addSourceFileAtPath(modelFilePath);
    }
    const modelFile = project.getSourceFile(modelFilePath);

    if (modelFile) {
      const repoImport = modelFile.getImportDeclaration(
        d => d.getModuleSpecifierValue() === '@loopback/repository',
      );
      if (repoImport) {
        const namedImports = repoImport.getNamedImports().map(n => n.getName());
        if (!namedImports.includes(type)) {
          repoImport.addNamedImport(type);
        }
      } else {
        modelFile.addImportDeclaration({
          moduleSpecifier: '@loopback/repository',
          namedImports: [type],
        });
      }

      if (sourceModel !== targetModel) {
        const targetImportPath = `../models/${targetFileName}.model`;
        const targetImport = modelFile.getImportDeclaration(
          d => d.getModuleSpecifierValue() === targetImportPath,
        );
        if (!targetImport) {
          modelFile.addImportDeclaration({
            moduleSpecifier: targetImportPath,
            namedImports: [targetClassName],
          });
        }
      }

      const modelClass = modelFile.getClass(sourceClassName);
      if (modelClass) {
        const existingProp = modelClass.getProperty(targetPropName);

        const decoratorArgs = [`() => ${targetClassName}`];
        const configObj = {};

        //If reusing a foreign key column name as the relation property, pass keyTo config if needed
        if (foreignKeyName && type === 'belongsTo') {
          //TODO: BelongsTo takes options as second argument, e.g. {keyTo: ...}
        }

        if (Object.keys(configObj).length > 0) {
          decoratorArgs.push(
            utils.stringifyObject(configObj, {inlineCharacterLimit: Infinity}),
          );
        }

        if (existingProp) {
          // If property already exists (e.g. column property), transform @property into unified relation decorator
          const existingRelationDec = existingProp.getDecorator(type);
          if (!existingRelationDec) {
            const propertyDecorator = existingProp.getDecorator('property');
            let propertyArgText = '';
            if (propertyDecorator) {
              const args = propertyDecorator.getArguments();
              if (args.length > 0) {
                propertyArgText = args[0].getText();
              }
              propertyDecorator.remove();
            }

            const relationConfig = {};
            relationConfig.name = relationName;

            // LoopBack signature: @belongsTo(target, relationOptions, propertyDefinition)
            if (propertyArgText) {
              decoratorArgs.push(
                utils.stringifyObject(relationConfig, {
                  inlineCharacterLimit: Infinity,
                }),
              );
              decoratorArgs.push(propertyArgText);
            } else if (Object.keys(relationConfig).length > 0) {
              decoratorArgs.push(
                utils.stringifyObject(relationConfig, {
                  inlineCharacterLimit: Infinity,
                }),
              );
            }

            existingProp.insertDecorator(0, {
              name: type,
              arguments: decoratorArgs,
            });
          }
        } else {
          // Property does not exist, create a new property with relation decorator
          const relationConfig = {};
          relationConfig.name = relationName;
          if (Object.keys(relationConfig).length > 0) {
            decoratorArgs.push(
              utils.stringifyObject(relationConfig, {
                inlineCharacterLimit: Infinity,
              }),
            );
          }

          modelClass.addProperty({
            name: targetPropName,
            type: type === 'hasMany' ? `${targetClassName}[]` : targetClassName,
            decorators: [
              {
                name: type,
                arguments: decoratorArgs,
              },
            ],
            leadingTrivia: writer => writer.blankLine(),
          });
        }
      }
    }

    // 2. Modify Source Repository File (add accessor, getter param, property, & inclusion resolver)
    const repoFilePath = path.join(
      projectRoot,
      'src',
      'repositories',
      `${sourceFileName}.repository.ts`,
    );
    if (fs.existsSync(repoFilePath)) {
      project.addSourceFileAtPath(repoFilePath);
    }
    const repoFile = project.getSourceFile(repoFilePath);

    if (repoFile) {
      const coreImport = repoFile.getImportDeclaration(
        d => d.getModuleSpecifierValue() === '@loopback/core',
      );
      if (coreImport) {
        const named = coreImport.getNamedImports().map(n => n.getName());
        if (!named.includes('Getter')) {
          coreImport.addNamedImport('Getter');
        }
      } else {
        repoFile.addImportDeclaration({
          moduleSpecifier: '@loopback/core',
          namedImports: ['Getter', 'inject'],
        });
      }

      const targetRepoName = `${targetClassName}Repository`;
      const targetRepoImportPath = `./${targetFileName}.repository`;
      const existingRepoImport = repoFile.getImportDeclaration(
        d => d.getModuleSpecifierValue() === targetRepoImportPath,
      );
      if (!existingRepoImport && sourceFileName !== targetFileName) {
        repoFile.addImportDeclaration({
          moduleSpecifier: targetRepoImportPath,
          namedImports: [targetRepoName],
        });
      }

      const repoClass = repoFile.getClass(`${sourceClassName}Repository`);
      const repoImports = new Set();
      if (repoClass) {
        const targetRepoParamName = `${utils.camelCase(targetModel)}RepositoryGetter`;
        const ctor = repoClass.getConstructors()[0];

        if (ctor) {
          const hasParam = ctor
            .getParameters()
            .some(p => p.getName() === targetRepoParamName);
          if (!hasParam) {
            ctor.addParameter({
              name: targetRepoParamName,
              type: `Getter<${targetRepoName}>`,
              decorators: [
                {
                  name: 'repository.getter',
                  arguments: [`'${targetRepoName}'`],
                },
              ],
            });
            repoImports.add('repository');
          }

          const ctorBodyText = ctor.getBody()?.getText() || '';
          const accessorCreationMethod =
            type === 'hasMany'
              ? 'createHasManyRepositoryFactoryFor'
              : type === 'hasOne'
                ? 'createHasOneRepositoryFactoryFor'
                : 'createBelongsToAccessorFor';

          const initStmt = `this.${relationName} = this.${accessorCreationMethod}('${relationName}', ${targetRepoParamName});`;
          const resolverStmt = `this.registerInclusionResolver('${relationName}', this.${relationName}.inclusionResolver);`;

          if (!ctorBodyText.includes(initStmt)) {
            ctor.addStatements(initStmt);
          }
          if (!ctorBodyText.includes(resolverStmt)) {
            ctor.addStatements(resolverStmt);
          }
        }

        const existingProp = repoClass.getProperty(relationName);
        if (!existingProp) {
          const accessorTypeName =
            type === 'hasMany'
              ? 'HasManyRepositoryFactory'
              : type === 'hasOne'
                ? 'HasOneRepositoryFactory'
                : 'BelongsToAccessor';

          const repoPkgImport = repoFile.getImportDeclaration(
            d => d.getModuleSpecifierValue() === '@loopback/repository',
          );
          if (repoPkgImport) {
            const named = repoPkgImport.getNamedImports().map(n => n.getName());
            if (!named.includes(accessorTypeName)) {
              repoPkgImport.addNamedImport(accessorTypeName);
            }
          }

          const repoImport = repoFile.getImportDeclaration(
            d => d.getModuleSpecifierValue() === '@loopback/repository',
          );
          if (repoImport) {
            const namedImports = repoImport
              .getNamedImports()
              .map(n => n.getName());
            Array.from(repoImports).forEach(eachImport => {
              if (!namedImports.includes(eachImport)) {
                repoImport.addNamedImport(eachImport);
              }
            });
          } else {
            repoFile.addImportDeclaration({
              moduleSpecifier: '@loopback/repository',
              namedImports: Array.from(repoImports),
            });
          }

          repoClass.addProperty({
            name: relationName,
            isReadonly: true,
            scope: 'public',
            type: `${accessorTypeName}<${targetClassName}, typeof ${sourceClassName}.prototype.id>`,
            leadingTrivia: writer => writer.blankLine(),
          });

          const modelImportsInRepo = repoFile.getImportDeclaration(
            d => d.getModuleSpecifierValue() === '../models',
          );
          if (modelImportsInRepo) {
            const namedImports = modelImportsInRepo
              .getNamedImports()
              .map(n => n.getName());
            if (!namedImports.includes(targetClassName)) {
              modelImportsInRepo.addNamedImport(targetClassName);
            }
          } else {
            repoFile.addImportDeclaration({
              moduleSpecifier: '../models',
              namedImports: [targetClassName],
            });
          }
        }
      }
    }

    // 3. Generate Relation Controller File
    const controllerFileName = `${sourceFileName}-${targetFileName}.controller.ts`;
    const controllerFilePath = path.join(
      projectRoot,
      'src',
      'controllers',
      controllerFileName,
    );
    let controllerFile = project.getSourceFile(controllerFilePath);

    if (!controllerFile) {
      controllerFile = project.createSourceFile(controllerFilePath, '', {
        overwrite: true,
      });

      const sourceRepoName = `${sourceClassName}Repository`;
      const targetRepoName = `${targetClassName}Repository`;
      const sourceRepoParam = `${utils.camelCase(sourceClassName)}Repository`;

      const repoImports = Array.from(new Set([sourceRepoName, targetRepoName]));

      controllerFile.addImportDeclarations([
        {
          moduleSpecifier: '@loopback/core',
          namedImports: ['inject'],
        },
        {
          moduleSpecifier: '@loopback/repository',
          namedImports: ['repository', 'Filter'],
        },
        {
          moduleSpecifier: '@loopback/rest',
          namedImports: ['get', 'param', 'getModelSchemaRef'],
        },
        {
          moduleSpecifier: '../models',
          namedImports:
            sourceModel === targetModel
              ? [sourceClassName]
              : [sourceClassName, targetClassName],
        },
        {
          moduleSpecifier: '../repositories',
          namedImports: repoImports,
        },
      ]);

      const controllerClassName = `${sourceClassName}${targetClassName}Controller`;
      const controllerClass = controllerFile.addClass({
        name: controllerClassName,
        isExported: true,
      });

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

      if (type === 'hasMany') {
        const targetPathSegment = utils.kebabCase(targetModel) + 's';
        const basePathSegment = utils.pluralize(utils.kebabCase(sourceModel));
        const routePath = `/${basePathSegment}/{id}/${targetPathSegment}`;

        const decoratorConfig = `{
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
          name: `find${targetClassName}s`,
          isAsync: true,
          returnType: `Promise<${targetClassName}[]>`,
          decorators: [
            {
              name: 'get',
              arguments: [`'${routePath}'`, decoratorConfig],
            },
          ],
          parameters: [
            {
              name: 'id',
              type: `typeof ${sourceClassName}.prototype.id`,
              decorators: [
                {
                  name: 'param.path.number',
                  arguments: ["'id'"],
                },
              ],
            },
            {
              name: 'filter',
              type: `Filter<${targetClassName}>`,
              decorators: [
                {
                  name: 'param.query.object',
                  arguments: ["'filter'"],
                },
              ],
            },
          ],
          statements: [
            `return this.${sourceRepoParam}.${relationName}(id).find(filter);`,
          ],
        });
      } else if (type === 'belongsTo' || type === 'hasOne') {
        const targetPathSegment = utils.kebabCase(targetModel);
        const basePathSegment = utils.pluralize(utils.kebabCase(sourceModel));
        const routePath = `/${basePathSegment}/{id}/${targetPathSegment}`;

        const decoratorConfig = `{
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
        controllerClass.addMethod({
          name: `get${targetClassName}`,
          isAsync: true,
          returnType: `Promise<${targetClassName}>`,
          decorators: [
            {
              name: 'get',
              arguments: [`'${routePath}'`, decoratorConfig],
            },
          ],
          parameters: [
            {
              name: 'id',
              type: `typeof ${sourceClassName}.prototype.id`,
              decorators: [
                {
                  name: 'param.path.number',
                  arguments: ["'id'"],
                },
              ],
            },
          ],
          statements: [`return this.${sourceRepoParam}.${relationName}(id);`],
        });
      }
    }
    controllerFile.formatText();
  }
  await project.save();
  debug(
    'Models, repositories, relations, and controllers generated and saved successfully.',
  );
  console.log(
    chalk.green(
      g.f(
        'Models, repositories, relations, and controllers generated and saved successfully.',
      ),
    ),
  );
}

module.exports = {
  discoverRelations,
};
