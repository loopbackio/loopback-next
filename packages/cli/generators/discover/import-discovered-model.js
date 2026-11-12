// Copyright IBM Corp. and LoopBack contributors 2019. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const {pascalCase, stringifyModelSettings} = require('../../lib/utils');
const {sanitizeProperty} = require('../../lib/model-discoverer');
const {
  createPropertyTemplateData,
  findBuiltinType,
} = require('../model/property-definition');

module.exports = {
  importDiscoveredModel,
};

/**
 * Convert model definition created by loopback-datasource-juggler discovery
 * into template data used by LB4 model generator.
 *
 * @param {object} discoveredDefinition Model definition as discovered from DB
 * @param {object} [options]
 * @param {string} [options.connector] Name of the connector used for discovery
 * @returns {object} Template data for model source file template
 */
function importDiscoveredModel(discoveredDefinition, options = {}) {
  const modelName = discoveredDefinition.name;
  const templateData = {
    name: modelName,
    className: pascalCase(modelName),
    modelBaseClass: 'Entity',
    isModelBaseBuiltin: true,
    settings: importModelSettings(discoveredDefinition.settings),
    properties: importModelProperties(discoveredDefinition.properties, options),
    allowAdditionalProperties: true,
  };

  templateData.modelSettings = stringifyModelSettings(templateData.settings);

  return templateData;
}

function importModelSettings(discoveredSettings = {}) {
  // Currently a no-op, we may want to apply transformation in the future
  // See migrateModelSettings in ../import-lb3-models/migrate-model.js
  return {
    // Shallow-clone to avoid accidental modification of input data
    ...discoveredSettings,
  };
}

function importModelProperties(discoveredProps, options) {
  const templateData = {};
  for (const prop in discoveredProps) {
    templateData[prop] = importPropertyDefinition(
      discoveredProps[prop],
      options,
    );
  }
  return templateData;
}

function importPropertyDefinition(discoveredDefinition, options = {}) {
  const propDef = {
    ...discoveredDefinition,
  };

  const builtinType = findBuiltinType(propDef.type);
  if (builtinType) propDef.type = builtinType;

  // PostgreSQL rejects values exceeding the column length, so mirror the
  // length as JSON schema `maxLength` to let request validation catch it.
  // Other connectors (e.g. MySQL) only enforce it in strict SQL mode, so they
  // are left untouched. The `length` property is preserved.
  if (
    options.connector === 'postgresql' &&
    propDef.type === 'string' &&
    Number.isInteger(propDef.length) &&
    propDef.length > 0
  ) {
    propDef.jsonSchema = {
      maxLength: propDef.length,
      ...propDef.jsonSchema,
    };
  }

  sanitizeProperty(propDef);
  return createPropertyTemplateData(propDef);
}
