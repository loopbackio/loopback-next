// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const tsquery = require('@phenomnomnominal/tsquery').tsquery;
const debug = require('./debug')('ast-query');

const tsArtifact = {
  ClassDeclaration: 'ClassDeclaration',
  PropertyDeclaration: 'PropertyDeclaration',
  Identifier: 'Identifier',
  Decorator: 'Decorator',
  CallExpression: 'CallExpression',
  ObjectLiteralExpression: 'ObjectLiteralExpression',
  PropertyAssignment: 'PropertyAssignment',
  PropertyDeclaration: 'PropertyDeclaration',
  TrueKeywordTrue: 'TrueKeyword[value="true"]',
  // the following are placed in case it is needed to explore more artifacts
  IfStatement: 'IfStatement',
  ForStatement: 'ForStatement',
  WhileStatement: 'WhileStatement',
  DoStatement: 'DoStatement',
  VariableStatement: 'VariableStatement',
  FunctionDeclaration: 'FunctionDeclaration',
  ArrowFunction: 'ArrowFunction',
  ImportDeclaration: 'ImportDeclaration',
  StringLiteral: 'StringLiteral',
  FalseKeyword: 'FalseKeyword',
  NullKeyword: 'NullKeyword',
  AnyKeyword: 'AnyKeyword',
  NumericLiteral: 'NumericLiteral',
  NoSubstitutionTemplateLiteral: 'NoSubstitutionTemplateLiteral',
  TemplateExpression: 'TemplateExpression',
};

const RootNodesFindID = [
  // Defaul format generated by lb4 model
  [
    tsArtifact.ClassDeclaration,
    tsArtifact.PropertyDeclaration,
    tsArtifact.Identifier,
  ],
  // Model JSON definition inside the @model decorator
  [
    tsArtifact.ClassDeclaration,
    tsArtifact.Decorator,
    tsArtifact.CallExpression,
    tsArtifact.ObjectLiteralExpression,
    tsArtifact.PropertyAssignment,
    tsArtifact.ObjectLiteralExpression,
    tsArtifact.PropertyAssignment,
    tsArtifact.Identifier,
  ],
  // Model JSON static definition inside the Class
  [
    tsArtifact.ClassDeclaration,
    tsArtifact.PropertyDeclaration,
    tsArtifact.ObjectLiteralExpression,
    tsArtifact.PropertyAssignment,
    tsArtifact.ObjectLiteralExpression,
    tsArtifact.PropertyAssignment,
    tsArtifact.Identifier,
  ],
];
const ChildNodesFindID = [
  // Defaul format generated by lb4 model
  [
    tsArtifact.ClassDeclaration,
    tsArtifact.PropertyDeclaration,
    tsArtifact.Decorator,
    tsArtifact.CallExpression,
    tsArtifact.ObjectLiteralExpression,
    tsArtifact.PropertyAssignment,
    tsArtifact.TrueKeywordTrue,
  ],

  // Model JSON definition inside the @model decorator
  [
    tsArtifact.ClassDeclaration,
    tsArtifact.Decorator,
    tsArtifact.CallExpression,
    tsArtifact.ObjectLiteralExpression,
    tsArtifact.PropertyAssignment,
    tsArtifact.ObjectLiteralExpression,
    tsArtifact.PropertyAssignment,
    tsArtifact.ObjectLiteralExpression,
    tsArtifact.PropertyAssignment,
    tsArtifact.TrueKeywordTrue,
  ],
  // Model JSON static definition inside the Class
  [
    tsArtifact.ClassDeclaration,
    tsArtifact.PropertyDeclaration,
    tsArtifact.ObjectLiteralExpression,
    tsArtifact.PropertyAssignment,
    tsArtifact.ObjectLiteralExpression,
    tsArtifact.PropertyAssignment,
    tsArtifact.ObjectLiteralExpression,
    tsArtifact.PropertyAssignment,
    tsArtifact.TrueKeywordTrue,
  ],
];

/**
 * Parse the file using the possible formats specified in the arrays
 * rootNodesFindID and childNodesFindID
 * @param {string} fileContent with a model.ts class
 */
exports.getIdFromModel = async function(fileContent) {
  let nodePos = 0;
  let retVal = null;

  const ast = tsquery.ast(fileContent);
  for (let rootNodes of RootNodesFindID) {
    const propertyArr = [];
    const stRootNode = rootNodes.join('>');
    const nodes = tsquery(ast, stRootNode);

    debug(`rootNode ${stRootNode}`);

    for (let a of nodes) {
      propertyArr.push(a.escapedText);
    }

    const stChildNode = ChildNodesFindID[nodePos].join('>');
    const subnodes = tsquery(ast, stChildNode);

    let i = 0;
    for (let a of subnodes) {
      if (a.parent.name.escapedText === 'id') {
        // we found the primary key for the model
        retVal = propertyArr[i];
        debug(`found key: ${retVal}`);
        break;
      }
      i++;
    }

    if (retVal !== null) {
      break;
    }

    nodePos++;
  }

  return retVal;
};
