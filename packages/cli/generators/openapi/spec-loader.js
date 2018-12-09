// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const chalk = require('chalk');
const SwaggerParser = require('swagger-parser');
const swagger2openapi = require('swagger2openapi');
const {debugJson} = require('./utils');
const _ = require('lodash');
const {generateControllerSpecs} = require('./spec-helper');
const {generateModelSpecs, registerNamedSchemas} = require('./schema-helper');

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

  spec = _.cloneDeepWith(spec, o => {
    if (o.$ref) {
      o['x-$ref'] = o.$ref;
    }
  });

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
    spec = await parser.dereference(spec);
  }

  return spec;
}

async function loadAndBuildSpec(
  url,
  {log, validate, promoteAnonymousSchemas} = {},
) {
  const apiSpec = await loadSpec(url, {log, validate});
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
