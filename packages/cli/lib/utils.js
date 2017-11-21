// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const fs = require('fs');
const util = require('util');
const regenerate = require('regenerate');
const template = require('lodash.template');

/**
 * Returns a valid variable name regex;
 * taken from https://gist.github.com/mathiasbynens/6334847
 */
function generateValidRegex() {
  const get = function(what) {
    return require('unicode-10.0.0/' + what + '/code-points.js');
  };
  const ID_Start = get('Binary_Property/ID_Start');
  const ID_Continue = get('Binary_Property/ID_Continue');
  const compileRegex = template(
    '^(?:<%= identifierStart %>)(?:<%= identifierPart %>)*$'
  );
  const identifierStart = regenerate(ID_Start).add('$', '_');
  const identifierPart = regenerate(ID_Continue).add(
    '$',
    '_',
    '\u200C',
    '\u200D'
  );
  const regex = compileRegex({
    identifierStart: identifierStart.toString(),
    identifierPart: identifierPart.toString(),
  });
  return new RegExp(regex);
}
const validRegex = generateValidRegex();
exports.validRegex = validRegex;

/**
 * validate application (module) name
 * @param name
 * @returns {String|Boolean}
 */
exports.validateClassName = function(name) {
  if (!name || name === '') {
    return 'Application name cannot be empty';
  }
  if (name.match(validRegex)) {
    return true;
  }
  if (!isNaN(name.charAt(0))) {
    return util.format('Application name cannot start with a number: %s', name);
  }
  if (name.includes('.')) {
    return util.format('Application name cannot contain .: %s', name);
  }
  if (name.match(/[\/@\s\+%:]/)) {
    return util.format(
      'Application name cannot contain special characters (/@+%: ): %s',
      name
    );
  }
  if (name.toLowerCase() === 'node_modules') {
    return util.format('Application name cannot be node_modules');
  }
  if (name.toLowerCase() === 'favicon.ico') {
    return util.format('Application name cannot be favicon.ico');
  }
  return util.format('Application name is invalid: %s', name);
};

/**
 * Validate project directory to not exist
 */
exports.validateyNotExisting = function(path) {
  if (fs.existsSync(path)) {
    return util.format('Directory %s already exists.', path);
  }
  return true;
};

/**
 * Validation for file name and existing directory
 */
exports.validateNameExistance = function() {};

/**
 * Converts a name to class name after validation
 */
exports.toClassName = function(name) {
  if (name == '') return new Error('no input');
  if (typeof name != 'string' || name == null) return new Error('bad input');
  return name.substring(0, 1).toUpperCase() + name.substring(1);
};

/**
 * Converts a name to file name after validation
 */
exports.toFileName = function(name) {
  if (name == '') return new Error('no input');
  if (typeof name != 'string' || name == null) return new Error('bad input');
  return name.substring(0, 1).toLowerCase() + name.substring(1);
};
