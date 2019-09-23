// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const TS_TYPES = ['string', 'number', 'object', 'boolean', 'any'];
const NON_TS_TYPES = ['geopoint', 'date'];
const BUILTIN_TYPES = [...TS_TYPES, ...NON_TS_TYPES];

module.exports = {
  createPropertyTemplateData,
  BUILTIN_TYPES,
};

/**
 * Convert property definition in LB4 style to data needed by model template
 * @param {object} val The property definition
 * @returns {object} Data for model-property template
 */
function createPropertyTemplateData(val) {
  // shallow clone the object - don't modify original data!
  val = {...val};

  // Default tsType is the type property
  val.tsType = val.type;

  // Override tsType based on certain type values
  if (val.type === 'array') {
    if (TS_TYPES.includes(val.itemType)) {
      val.tsType = `${val.itemType}[]`;
    } else if (val.type === 'buffer') {
      val.tsType = 'Buffer[]';
    } else {
      val.tsType = 'string[]';
    }
  } else if (val.type === 'buffer') {
    val.tsType = 'Buffer';
  }

  if (NON_TS_TYPES.includes(val.tsType)) {
    val.tsType = 'string';
  }

  if (
    val.defaultValue &&
    NON_TS_TYPES.concat(['string', 'any']).includes(val.type)
  ) {
    val.defaultValue = `'${val.defaultValue}'`;
  }

  // Convert Type to include '' for template
  val.type = `'${val.type}'`;
  if (val.itemType) {
    val.itemType = `'${val.itemType}'`;
  }

  // If required is false, we can delete it as that's the default assumption
  // for this field if not present. This helps to avoid polluting the
  // decorator with redundant properties.
  if (!val.required) {
    delete val.required;
  }

  // We only care about marking the `id` field as `id` and not fields that
  // are not the id so if this is false we delete it similar to `required`.
  if (!val.id) {
    delete val.id;
  }

  return val;
}
