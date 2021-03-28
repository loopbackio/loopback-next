// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const debug = require('../../lib/debug')('openapi-generator');
const {mapSchemaType, registerSchema} = require('./schema-helper');
const {
  isExtension,
  titleCase,
  debugJson,
  toFileName,
  printSpecObject,
  camelCase,
  escapeIdentifier,
} = require('./utils');

const {validRegex} = require('../../lib/utils');

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
 * Merge path level parameters into the operation level
 * @param {OperationObject} operationSpec Operation spec
 * @param {ParameterObject[]} pathLevelParams Path level parameters
 */
function mergeParameters(operationSpec, pathLevelParams) {
  if (!pathLevelParams || pathLevelParams.length === 0) return;
  for (const p of pathLevelParams) {
    operationSpec.parameters = operationSpec.parameters || [];
    let found = false;
    for (const param of operationSpec.parameters) {
      if (p.name === param.name && p.in === param.in) {
        // The parameter has been overridden at operation level
        found = true;
        break;
      }
    }
    if (!found) {
      operationSpec.parameters.push(p);
    }
  }
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
    const pathLevelParams = apiSpec.paths[path].parameters;
    for (const verb in apiSpec.paths[path]) {
      if (isExtension(verb) || !isHttpVerb(verb)) continue;
      debug('Verb: %s', verb);
      const op = apiSpec.paths[path][verb];
      mergeParameters(op, pathLevelParams);
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
      } else if (Array.isArray(op.tags) && op.tags.length) {
        // Only add the operation to first tag to avoid duplicate routes
        controllers = [titleCase(op.tags[0] + 'Controller')];
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
          const apiSpecJson = printSpecObject({
            components: apiSpec.components,
            paths: {},
          });
          controllerSpec.decoration = `@api(${apiSpecJson})`;
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
 * @internal
 */
function getMethodName(opSpec) {
  let methodName;

  if (opSpec['x-operation-name']) {
    methodName = opSpec['x-operation-name'];
  } else if (opSpec.operationId) {
    methodName = escapeIdentifier(opSpec.operationId);
  } else {
    throw new Error(
      'Could not infer method name from OpenAPI Operation Object. OpenAPI Operation Objects must have either `x-operation-name` or `operationId`.',
    );
  }

  return camelCase(methodName);
}

function registerAnonymousSchema(names, schema, typeRegistry) {
  if (!typeRegistry.promoteAnonymousSchemas) {
    // Skip anonymous schemas
    return;
  }

  // Skip referenced schemas
  if (schema['x-$ref']) return;

  // Only map object/array types
  if (
    schema.properties ||
    schema.type === 'object' ||
    schema.type === 'array'
  ) {
    if (typeRegistry.anonymousSchemaNames == null) {
      typeRegistry.anonymousSchemaNames = new Set();
    }
    // Infer the schema name
    let schemaName;
    if (Array.isArray(names)) {
      schemaName = names.join('-');
    } else if (typeof names === 'string') {
      schemaName = names;
    }

    if (!schemaName && schema.title) {
      schemaName = schema.title;
    }

    schemaName = camelCase(schemaName);

    // Make sure the schema name is unique
    let index = 1;
    while (typeRegistry.anonymousSchemaNames.has(schemaName)) {
      schemaName = schemaName + index++;
    }
    typeRegistry.anonymousSchemaNames.add(schemaName);

    registerSchema(schemaName, schema, typeRegistry);
  }
}

/**
 * Build method spec for an operation
 * @param {object} OpenAPI operation
 */
function buildMethodSpec(controllerSpec, op, options) {
  const methodName = getMethodName(op.spec);
  const opName = op.spec['x-operation-name'] || op.spec['operationId'];
  controllerSpec.methodMapping[methodName] = opName;
  const comments = [];
  let args = [];
  let interfaceArgs = [];
  const namedParameters = [];
  const parameters = op.spec.parameters;
  // Keep track of param names to avoid duplicates
  const paramNames = {};
  const interfaceParamNames = {};
  if (parameters) {
    args = parameters.map(p => {
      const {paramType, argName} = buildParameter(p, paramNames, comments);
      const paramJson = printSpecObject(p);
      const optionalType = !p.required ? ' | undefined' : '';
      return `@param(${paramJson}) ${argName}: ${paramType.signature}${optionalType}`;
    });
    interfaceArgs = parameters.map(p => {
      const param = buildParameter(p, interfaceParamNames);
      namedParameters.push(param);
      const {paramType, argName} = param;
      const optionalType = !p.required ? ' | undefined' : '';
      return `${argName}: ${paramType.signature}${optionalType}`;
    });
  }
  if (op.spec.requestBody) {
    /**
     * requestBody:
     *  description: Pet to add to the store
     *  required: true
     *  content:
     *    application/json:
     *      schema:
     *        $ref: '#/components/schemas/NewPet'
     */
    let bodyType = {signature: 'unknown'};
    const content = op.spec.requestBody.content;
    const contentType =
      content &&
      (content['application/json'] || content[Object.keys(content)[0]]);

    let bodyName = 'requestBody';
    if (bodyName in paramNames) {
      bodyName = `${bodyName}${paramNames[bodyName]++}`;
    }
    bodyName = escapeIdentifier(bodyName);
    if (contentType && contentType.schema) {
      registerAnonymousSchema(
        [methodName, bodyName],
        contentType.schema,
        options,
      );
      bodyType = mapSchemaType(contentType.schema, options);
      addImportsForType(bodyType);
    }
    const bodyParam = bodyName; // + (op.spec.requestBody.required ? '' : '?');
    // Add body as the last param
    const bodySpecJson = printSpecObject(op.spec.requestBody);
    args.push(
      `@requestBody(${bodySpecJson}) ${bodyParam}: ${bodyType.signature}`,
    );
    interfaceArgs.push(`${bodyParam}: ${bodyType.signature}`);
    namedParameters.push({
      paramName: 'requestBody',
      paramType: bodyType,
      argName: bodyParam,
    });
    let bodyDescription = op.spec.requestBody.description || '';
    bodyDescription = bodyDescription ? ` ${bodyDescription}` : '';
    comments.push(`@param ${bodyName}${bodyDescription}`);
  }
  let returnType = {signature: 'unknown'};
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
      if (code !== '200' && code !== '201') continue;
      const content = responses[code].content;
      const contentType =
        content &&
        (content['application/json'] || content[Object.keys(content)[0]]);
      if (contentType && contentType.schema) {
        registerAnonymousSchema(
          [methodName, 'responseBody'],
          contentType.schema,
          options,
        );
        returnType = mapSchemaType(contentType.schema, options);
        addImportsForType(returnType);
        comments.push(`@returns ${responses[code].description || ''}`);
        break;
      }
    }
  }
  const signature = `async ${methodName}(${args.join(', ')}): Promise<${
    returnType.signature
  }>`;
  const signatureForInterface = `${methodName}(${interfaceArgs.join(
    ', ',
  )}): Promise<${returnType.signature}>`;

  const argTypes = namedParameters
    .map(p => {
      if (p.paramName.match(validRegex)) {
        return `${p.paramName}: ${p.paramType.signature}`;
      }
      return `'${p.paramName}': ${p.paramType.signature}`;
    })
    .join('; ');
  const signatureForNamedParams = `${methodName}(params: { ${argTypes} }): Promise<${returnType.signature}>`;

  comments.unshift(op.spec.description || '', '');

  // Normalize path variable names to alphanumeric characters including the
  // underscore (Equivalent to [A-Za-z0-9_]). Please note `@loopback/rest`
  // does not allow other characters that don't match `\w`.
  const opPath = op.path.replace(/\{[^\}]+\}/g, varName =>
    varName.replace(/[^\w\{\}]+/g, '_'),
  );
  const opSpecJson = printSpecObject(op.spec);
  const methodSpec = {
    description: op.spec.description,
    comments,
    decoration: `@operation('${op.verb}', '${opPath}', ${opSpecJson})`,
    signature,
    signatureForInterface,
    signatureForNamedParams,
  };
  if (op.spec['x-implementation']) {
    methodSpec.implementation = op.spec['x-implementation'];
  }
  return methodSpec;

  /**
   * Build the parameter
   * @param {object} paramSpec
   * @param {string[]} names
   * @param {string[]} _comments
   */
  function buildParameter(paramSpec, names, _comments) {
    let argName = escapeIdentifier(paramSpec.name);
    if (argName in names) {
      argName = `${argName}${names[argName]++}`;
    } else {
      names[argName] = 1;
    }
    registerAnonymousSchema([methodName, argName], paramSpec.schema, options);
    let propSchema = paramSpec.schema;
    if (propSchema == null) {
      /*
        {
          name: 'where',
          in: 'query',
          content: { 'application/json': { schema: [Object] } }
        }
        */
      const content = paramSpec.content;
      const json = content && content['application/json'];
      propSchema = json && json.schema;
      if (propSchema == null && content) {
        for (const m of content) {
          propSchema = content[m].schema;
          if (propSchema) break;
        }
      }
    }
    propSchema = propSchema || {type: 'string'};
    const paramType = mapSchemaType(propSchema, options);
    addImportsForType(paramType);
    if (Array.isArray(_comments)) {
      _comments.push(`@param ${argName} ${paramSpec.description || ''}`);
    }
    // Normalize parameter name to match `\w`
    let paramName = paramSpec.name;
    if (paramSpec.in === 'path') {
      paramName = paramName.replace(/[^\w]+/g, '_');
    }
    return {paramName, paramType, argName};
  }

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
      decoration: entry.decoration,
      description: entry.description || '',
      className: controller,
      // Class name for service proxy
      serviceClassName: getBaseName(controller, 'Controller') + 'Service',
      imports: [],
      methodMapping: {},
    };
    controllerSpec.methods = entry.operations.map(op =>
      buildMethodSpec(controllerSpec, op, options),
    );
    controllerSpec.methodMappingObject = printSpecObject(
      controllerSpec.methodMapping,
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
  const name = getBaseName(controllerName, 'Controller');
  return toFileName(name) + '.controller.ts';
}

/**
 * Get the base name by trimming the suffix
 * @param {string} fullName
 * @param {string} suffix
 */
function getBaseName(fullName, suffix) {
  if (fullName.endsWith(suffix)) {
    return fullName.substring(0, fullName.length - suffix.length);
  }
  return fullName;
}

function getServiceFileName(serviceName) {
  const name = getBaseName(serviceName, 'Service');
  return toFileName(name) + '.service.ts';
}

module.exports = {
  getControllerFileName,
  getMethodName,
  getServiceFileName,
  generateControllerSpecs,
};
