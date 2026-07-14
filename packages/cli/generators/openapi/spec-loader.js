// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const chalk = require('chalk');
const SwaggerParser = require('swagger-parser');
const swagger2openapi = require('swagger2openapi');
const {debugJson, cloneSpecObject} = require('./utils');
const {generateControllerSpecs} = require('./spec-helper');
const {generateModelSpecs, registerNamedSchemas} = require('./schema-helper');
const {ResolverError} = require('@apidevtools/json-schema-ref-parser');

/**
 * Load swagger specs from the given url or file path; handle yml or json
 * @param {String} specUrlStr The url or file path to the swagger spec
 */
async function loadSpec(specUrlStr, {log, validate} = {}) {
  if (typeof log === 'function') {
    log(chalk.blue('Loading ' + specUrlStr + '...'));
  }
  const parser = new SwaggerParser();
  let spec = await parser.parse(specUrlStr);
  if (spec.swagger === '2.0') {
    debugJson('Swagger spec loaded: ', spec);
    spec = (await swagger2openapi.convertObj(spec, {patch: true})).openapi;
    debugJson('OpenAPI spec converted from Swagger: ', spec);
  } else if (spec.openapi) {
    debugJson('OpenAPI spec loaded: ', spec);
  }

  spec = cloneSpecObject(spec);

  // Validate and deference the spec
  if (validate) {
    spec = await parser.validate(spec, {
      dereference: {
        circular: true, // Allow circular $refs
      },
      validate: {
        spec: true, // Don't validate against the Swagger spec
      },
    });
  } else {
    try {
      spec = await parser.dereference(spec);
    } catch (error) {
      // If returns http unauthorized error, ignore resolving external ref$ pointer
      if (error instanceof ResolverError) {
        spec = await parser.dereference(spec, {resolve: {external: false}});
      }
    }
  }

  return spec;
}

const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

async function loadAndBuildSpec(
  url,
  {log, validate, promoteAnonymousSchemas, prefix} = {},
) {
  let apiSpec = await loadSpec(url, {log, validate});
  const {components, paths} = apiSpec;
  let stringifiedApiSpecs = JSON.stringify(apiSpec, getCircularReplacer());

  if (prefix) {
    // rewrite WithRelations and append prefix
    stringifiedApiSpecs = stringifiedApiSpecs.replaceAll(
      'WithRelations',
      `${prefix}WithRelations`,
    );
    // adding prefix to paths
    if (paths) {
      Object.keys(paths).forEach(eachPath => {
        if (!eachPath.includes('{id}') && !eachPath.includes('count')) {
          const updatedPath =
            eachPath.slice(0, 0) +
            `/${prefix.toLowerCase()}/` +
            eachPath.slice(1);
          stringifiedApiSpecs = stringifiedApiSpecs.replaceAll(
            eachPath,
            updatedPath,
          );
        }
      });
    }
    // rewrite every item and append prefix in the start
    if (components) {
      const {schemas} = components;
      if (schemas) {
        Object.keys(schemas).forEach(item => {
          if (
            !item.startsWith('loopback') &&
            !item.startsWith('New') &&
            !item.endsWith('Relations') &&
            !item.endsWith('Partial') &&
            !item.includes('Through') &&
            !item.includes('.') &&
            !item.includes('Ping')
          ) {
            stringifiedApiSpecs = stringifiedApiSpecs.replaceAll(
              item,
              prefix + item,
            );
          }
          if (item.includes('Ping')) {
            stringifiedApiSpecs = stringifiedApiSpecs.replaceAll(
              'Ping',
              prefix + 'Ping',
            );
          }
        });
      }
    }
  }

  apiSpec = JSON.parse(stringifiedApiSpecs);

  // First populate the type registry for named schemas
  const typeRegistry = {
    objectTypeMapping: new Map(),
    schemaMapping: {},
    promoteAnonymousSchemas,
  };
  registerNamedSchemas(apiSpec, typeRegistry);
  const controllerSpecs = generateControllerSpecs(apiSpec, typeRegistry);
  const modelSpecs = generateModelSpecs(apiSpec, typeRegistry);
  return {
    apiSpec,
    modelSpecs,
    controllerSpecs,
  };
}

module.exports = {
  loadSpec,
  loadAndBuildSpec,
};
