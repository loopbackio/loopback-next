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
 * @returns {object} Template data for model source file template
 */
function importDiscoveredModel(discoveredDefinition) {
  const modelName = discoveredDefinition.name;
  const templateData = {
    name: modelName,
    className: pascalCase(modelName),
    modelBaseClass: 'Entity',
    isModelBaseBuiltin: true,
    settings: importModelSettings(discoveredDefinition.settings),
    properties: importModelProperties(discoveredDefinition.properties),
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

function importModelProperties(discoveredProps) {
  const templateData = {};
  for (const prop in discoveredProps) {
    templateData[prop] = importPropertyDefinition(discoveredProps[prop]);
  }
  return templateData;
}

function importPropertyDefinition(discoveredDefinition) {
  const propDef = {
    ...discoveredDefinition,
  };

  const builtinType = findBuiltinType(propDef.type);
  if (builtinType) propDef.type = builtinType;

  // Make the column length enforceable by the request/response validation
  // (and visible to databases running in strict SQL mode) by mirroring it
  // as JSON schema `maxLength`. The `length` property is preserved.
  if (
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
