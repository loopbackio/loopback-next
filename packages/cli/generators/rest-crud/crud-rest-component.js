// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const ast = require('ts-morph');
const path = require('path');

/**
 * Update `src/application.ts`
 * @param projectRoot - Project root directory
 */
async function updateApplicationTs(projectRoot) {
  const CRUD_REST_COMPONENT = 'CrudRestComponent';
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

  // import {CrudRestComponent} from '@loopback/rest-crud';
  const importDeclaration = {
    kind: ast.StructureKind.ImportDeclaration,
    moduleSpecifier: '@loopback/rest-crud',
    namedImports: [CRUD_REST_COMPONENT],
  };

  const pFile = project.addSourceFileAtPath(applicationTsFile);

  // Check if `import {CrudRestComponent} from '@loopback/rest-crud'` exists
  const restCrudImport = pFile.getImportDeclaration('@loopback/rest-crud');

  if (restCrudImport == null) {
    // Not found
    pFile.addImportDeclaration(importDeclaration);
  } else {
    // Further check named import for CrudRestComponent
    const names = restCrudImport.getNamedImports().map(i => i.getName());
    if (!names.includes(CRUD_REST_COMPONENT)) {
      restCrudImport.addNamedImport(CRUD_REST_COMPONENT);
    }
  }

  // Find the constructor
  const ctor = pFile.getClasses()[0].getConstructors()[0];
  const body = ctor.getBodyText();

  // Check if `this.component(CrudRestComponent)` exists
  if (!body.includes(`this.component(${CRUD_REST_COMPONENT}`)) {
    ctor.addStatements(`this.component(${CRUD_REST_COMPONENT});`);
  }

  await pFile.save();
}

exports.updateApplicationTs = updateApplicationTs;
