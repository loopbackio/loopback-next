// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const fs = require('fs');
const util = require('util');

const debug = require('../../lib/debug')('openapi-generator');
const {mapSchemaType} = require('./schema-helper');
const {
  isExtension,
  titleCase,
  debugJson,
  kebabCase,
  camelCase,
  escapeIdentifier,
  escapePropertyOrMethodName,
} = require('./utils');

const HTTP_VERBS = [
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
];

/**
 * Check if a key is an http verb
 * @param {string} key
 */
function isHttpVerb(key) {
  return key && HTTP_VERBS.includes(key.toLowerCase());
}

/**
 * Find the tag description by name
 * @param {object} apiSpec API spec object
 * @param {string} tag Tag name
 */
function getTagDescription(apiSpec, tag) {
  if (Array.isArray(apiSpec.tags)) {
    const tagEntry = apiSpec.tags.find(t => t.name === tag);
    return tagEntry && tagEntry.description;
  }
  return undefined;
}

/**
 * Group operations by controller class name
 * @param {object} apiSpec OpenAPI 3.x spec
 */
function groupOperationsByController(apiSpec) {
  const operationsMapByController = {};
  if (apiSpec.paths == null) return operationsMapByController;
  for (const path in apiSpec.paths) {
    if (isExtension(path)) continue;
    debug('Path: %s', path);
    for (const verb in apiSpec.paths[path]) {
      if (isExtension(verb) || !isHttpVerb(verb)) continue;
      debug('Verb: %s', verb);
      const op = apiSpec.paths[path][verb];
      const operation = {
        path,
        verb,
        spec: op,
      };
      debugJson('Operation', operation);
      // Default to `openapi` if no tags are present
      let controllers = ['OpenApiController'];
      if (op['x-controller-name']) {
        controllers = [op['x-controller-name']];
      } else if (op.tags) {
        controllers = op.tags.map(t => titleCase(t + 'Controller'));
      }
      controllers.forEach((c, index) => {
        /**
         * type ControllerSpec = {
         *   tag?: string;
         *   description?: string;
         *   operations: Operation[]
         * }
         */
        let controllerSpec = operationsMapByController[c];
        if (!controllerSpec) {
          controllerSpec = {operations: [operation]};
          if (op.tags && op.tags[index]) {
            controllerSpec.tag = op.tags[index];
            controllerSpec.description =
              getTagDescription(apiSpec, controllerSpec.tag) || '';
          }
          operationsMapByController[c] = controllerSpec;
        } else {
          controllerSpec.operations.push(operation);
        }
      });
    }
  }
  return operationsMapByController;
}

/**
 * Get the method name for an operation spec. If `x-operation-name` is set, use it
 * as-is. Otherwise, derive the name from `operationId`.
 *
 * @param {object} opSpec OpenAPI operation spec
 */
function getMethodName(opSpec) {
  return (
    opSpec['x-operation-name'] ||
    escapePropertyOrMethodName(camelCase(opSpec.operationId))
  );
}

/**
 * Build method spec for an operation
 * @param {object} OpenAPI operation
 */
function buildMethodSpec(controllerSpec, op, options) {
  const methodName = getMethodName(op.spec);
  let args = [];
  const parameters = op.spec.parameters;
  if (parameters) {
    // Keep track of param names to avoid duplicates
    const paramNames = {};
    args = parameters.map(p => {
      const name = escapeIdentifier(p.name);
      if (name in paramNames) {
        name = `${name}${paramNames[name]++}`;
      } else {
        paramNames[name] = 1;
      }
      const pType = mapSchemaType(p.schema, options);
      addImportsForType(pType);
      return `@param({name: '${p.name}', in: '${p.in}'}) ${name}: ${
        pType.signature
      }`;
    });
  }
  let returnType = 'any';
  const responses = op.spec.responses;
  if (responses) {
    /**
     * responses:
     *   '200':
     *     description: pet response
     *     content:
     *       application/json:
     *         schema:
     *           type: array
     *           items:
     *             $ref: '#/components/schemas/Pet'
     */
    for (const code in responses) {
      if (isExtension(code)) continue;
      if (code !== '200') continue;
      const content = responses[code].content;
      const jsonType = content && content['application/json'];
      if (jsonType && jsonType.schema) {
        returnType = mapSchemaType(jsonType.schema, options);
        addImportsForType(returnType);
      }
    }
  }
  const signature = `async ${methodName}(${args.join(', ')}): Promise<${
    returnType.signature
  }>`;
  return {
    description: op.spec.description,
    decoration: `@operation('${op.verb}', '${op.path}')`,
    signature,
  };

  function addImportsForType(typeSpec) {
    if (typeSpec.className && typeSpec.import) {
      const importStmt = typeSpec.import.replace('./', '../models/');
      if (!controllerSpec.imports.includes(importStmt)) {
        controllerSpec.imports.push(importStmt);
      }
    }
    if (!typeSpec.className && Array.isArray(typeSpec.imports)) {
      typeSpec.imports.forEach(i => {
        i = i.replace('./', '../models/');
        if (!controllerSpec.imports.includes(i)) {
          controllerSpec.imports.push(i);
        }
      });
    }
  }
}

/**
 * Build an array of controller specs
 * @param {object} operationsMapByController
 */
function buildControllerSpecs(operationsMapByController, options) {
  const controllerSpecs = [];
  for (const controller in operationsMapByController) {
    const entry = operationsMapByController[controller];
    const controllerSpec = {
      tag: entry.tag || '',
      description: entry.description || '',
      className: controller,
      imports: [],
    };
    controllerSpec.methods = entry.operations.map(op =>
      buildMethodSpec(controllerSpec, op, options),
    );
    controllerSpecs.push(controllerSpec);
  }
  return controllerSpecs;
}

/**
 * Generate an array of controller specs for the openapi spec
 * @param {object} apiSpec
 */
function generateControllerSpecs(apiSpec, options) {
  const operationsMapByController = groupOperationsByController(apiSpec);
  return buildControllerSpecs(operationsMapByController, options);
}

function getControllerFileName(controllerName) {
  let name = controllerName;
  if (controllerName.endsWith('Controller')) {
    name = controllerName.substring(
      0,
      controllerName.length - 'Controller'.length,
    );
  }
  return kebabCase(name) + '.controller.ts';
}

module.exports = {
  getControllerFileName,
  generateControllerSpecs,
};
