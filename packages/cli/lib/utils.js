// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const fs = require('fs');
const util = require('util');

/**
 * validate application (module) name
 * @param name
 * @returns {String|Boolean}
 */
exports.validateAppName = function(name) {
  if (name.charAt(0) === '.') {
    return util.format('Application name cannot start with .: %s', name);
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
  if (name !== encodeURIComponent(name)) {
    return util.format(
      'Application name cannot contain special characters escaped by' +
        ' encodeURIComponent: %s',
      name
    );
  }
  return true;
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
 * Convert a name to class name
 */
exports.toClassName = function(name) {
  const n = name.substring(0, 1).toUpperCase() + name.substring(1);
  return n.replace(/[\-\.@\s\+]/g, '_');
};
