'use strict';
const ast = require('ts-morph');
const path = require('path');

/**
 * Update `src/application.ts`
 * @param projectRoot - Project root directory
 */
async function updateApplicationTs(projectRoot) {
  const CACHE_COMPONENT = 'CacheComponent';
  const CACHE_BINDINGS = 'CacheBindings';
  const PROVIDER = 'CacheStrategyProvider';
  const applicationTsFile = path.join(projectRoot, 'src/application.ts');

  // Create an AST project
  const project = new ast.Project({
    manipulationSettings: {
      indentationText: ast.IndentationText.TwoSpaces,
      insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: false,
      newLineKind: ast.NewLineKind.LineFeed,
      quoteKind: ast.QuoteKind.Single,
    },
  });

  // import {CacheBindings, CacheComponent} from 'loopback-api-cache';
  const cacheImportDeclaration = {
    kind: ast.StructureKind.ImportDeclaration,
    moduleSpecifier: 'loopback-api-cache',
    namedImports: [CACHE_BINDINGS, CACHE_COMPONENT],
  };

  const pFile = project.addSourceFileAtPath(applicationTsFile);

  // Check if `import {CacheBindings, CacheComponent} from 'loopback-api-cache'` exists
  const cacheImport = pFile.getImportDeclaration('loopback-api-cache');

  if (cacheImport == null) {
    // Not found
    pFile.addImportDeclaration(cacheImportDeclaration);
  } else {
    // Further check named import for CacheComponent
    const names = cacheImport.getNamedImports().map(i => i.getName());
    if (!names.includes(CACHE_COMPONENT)) {
      cacheImport.addNamedImport(CACHE_COMPONENT);
    }
    if (!names.includes(CACHE_BINDINGS)) {
      cacheImport.addNamedImport(CACHE_BINDINGS);
    }
  }

  // import {CacheStrategyProvider} from './providers';
  const providerImportDeclaration = {
    kind: ast.StructureKind.ImportDeclaration,
    moduleSpecifier: './providers',
    namedImports: [PROVIDER],
  };
  const providerImport = pFile.getImportDeclaration('./providers');
  if (providerImport == null) {
    // Not found
    pFile.addImportDeclaration(providerImportDeclaration);
  }

  // Find the constructor
  const ctor = pFile.getClasses()[0].getConstructors()[0];
  const body = ctor.getBodyText();

  // Check if `this.component(CacheComponent)` exists
  if (!body.includes(`this.component(${CACHE_COMPONENT}`)) {
    ctor.addStatements(`this.component(${CACHE_COMPONENT});`);
    ctor.addStatements(
      `this.bind(${CACHE_BINDINGS}.CACHE_STRATEGY).toProvider(${PROVIDER});`,
    );
  }

  await pFile.save();
}

exports.updateApplicationTs = updateApplicationTs;
