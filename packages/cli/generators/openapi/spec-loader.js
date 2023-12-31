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
const openapiFilter = require('openapi-filter');

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

async function loadAndBuildSpec(
  url,
  {
    log,
    validate,
    promoteAnonymousSchemas,
    readonly,
    excludings,
    includings,
  } = {},
) {
  let apiSpec = await loadSpec(url, {log, validate});

  apiSpec = filterSpec(apiSpec, readonly, excludings, includings);

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

function getIndiciesOf(searchStr, str, caseSensitive) {
  const searchStrLen = searchStr.length;
  if (searchStrLen === 0) {
    return [];
  }
  let startIndex = 0,
    index;
  const indices = [];
  if (!caseSensitive) {
    str = str.toLowerCase();
    searchStr = searchStr.toLowerCase();
  }
  while ((index = str.indexOf(searchStr, startIndex)) > -1) {
    indices.push(index);
    startIndex = index + searchStrLen;
  }
  return indices;
}

function insertAtIndex(str, substring, index) {
  return str.slice(0, index) + substring + str.slice(index);
}

function applyFilters(specs, options) {
  const openapiComponent = specs.components;
  specs = openapiFilter.filter(specs, options);
  specs.components = openapiComponent;
  return specs;
}

function findIndexes(stringSpecs, regex) {
  let result;
  const indices = [];
  while ((result = regex.exec(stringSpecs))) {
    indices.push(result.index);
  }
  return indices;
}

function excludeOrIncludeSpec(specs, filter) {
  Object.keys(filter).forEach(filterKey => {
    const regex = new RegExp(filterKey, 'g');
    const actions = filter[filterKey];
    for (const key in specs.paths) {
      if (Object.hasOwnProperty.call(specs.paths, key)) {
        if (findIndexes(key, regex).length) {
          if (specs.paths[key]) {
            actions.forEach(action => {
              action = action.toLowerCase();
              if (specs.paths[key][action]) {
                specs.paths[key][action]['x-filter'] = true;
              }
            });
          }
        }
      }
    }
  });
  return specs;
}

function readonlySpec(specs) {
  let stringifiedSpecs = JSON.stringify(specs);
  const excludeOps = ['"post":', '"patch":', '"put":', '"delete":'];
  excludeOps.forEach(operator => {
    let indices = getIndiciesOf(operator, stringifiedSpecs);
    let indiciesCount = 0;
    while (indiciesCount < indices.length) {
      indices = getIndiciesOf(operator, stringifiedSpecs);
      const index = indices[indiciesCount];
      stringifiedSpecs = insertAtIndex(
        stringifiedSpecs,
        '"x-filter": true,',
        index + operator.length + 1,
      );
      indiciesCount++;
    }
  });
  return JSON.parse(stringifiedSpecs);
}

function filterSpec(specs, readonly, excludings, includings) {
  const options = {
    valid: true,
    info: true,
    strip: true,
    flags: ['x-filter'],
    servers: true,
    inverse: false,
  };
  if (excludings && excludings.length) {
    excludings.forEach(exclude => {
      specs = excludeOrIncludeSpec(specs, exclude);
    });
    specs = applyFilters(specs, options);
  }
  if (includings && includings.length) {
    includings.forEach(include => {
      specs = excludeOrIncludeSpec(specs, include);
    });
    options.inverse = true;
    specs = applyFilters(specs, options);
  }
  if (readonly) {
    options.inverse = false;
    specs = applyFilters(readonlySpec(specs), options);
  }
  return specs;
}

module.exports = {
  loadSpec,
  loadAndBuildSpec,
};
