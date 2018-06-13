// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const debug = require('../lib/debug')('utils');
const fs = require('fs');
const path = require('path');
const util = require('util');
const stream = require('stream');
var semver = require('semver');
const regenerate = require('regenerate');
const _ = require('lodash');
const pascalCase = require('change-case').pascalCase;
const promisify = require('util').promisify;
const camelCase = require('change-case').camelCase;
const pluralize = require('pluralize');
const urlSlug = require('url-slug');
const validate = require('validate-npm-package-name');
const Conflicter = require('yeoman-generator/lib/util/conflicter');

const readdirAsync = promisify(fs.readdir);

/**
 * Either a reference to util.promisify or its polyfill, depending on
 * your version of Node.
 */
exports.promisify = promisify;

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
  const compileRegex = _.template(
    '^(?:<%= identifierStart %>)(?:<%= identifierPart %>)*$',
  );
  const identifierStart = regenerate(ID_Start).add('$', '_');
  const identifierPart = regenerate(ID_Continue).add(
    '$',
    '_',
    '\u200C',
    '\u200D',
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
    return 'Class name cannot be empty';
  }
  if (name.match(validRegex)) {
    return true;
  }
  if (!isNaN(name.charAt(0))) {
    return util.format('Class name cannot start with a number: %s', name);
  }
  if (name.includes('.')) {
    return util.format('Class name cannot contain .: %s', name);
  }
  if (name.includes(' ')) {
    return util.format('Class name cannot contain spaces: %s', name);
  }
  if (name.includes('-')) {
    return util.format('Class name cannot contain hyphens: %s', name);
  }
  if (name.match(/[\/@\s\+%:]/)) {
    return util.format(
      'Class name cannot contain special characters (/@+%: ): %s',
      name,
    );
  }
  return util.format('Class name is invalid: %s', name);
};

/**
 * Validate project directory to not exist
 */
exports.validateNotExisting = function(path) {
  if (fs.existsSync(path)) {
    return util.format('Directory %s already exists.', path);
  }
  return true;
};

/**
 * Converts a name to class name after validation
 */
exports.toClassName = function(name) {
  if (name == '') return new Error('no input');
  if (typeof name != 'string' || name == null) return new Error('bad input');
  return name.substring(0, 1).toUpperCase() + name.substring(1);
};

exports.kebabCase = _.kebabCase;

exports.pascalCase = pascalCase;
exports.camelCase = camelCase;
exports.pluralize = pluralize;
exports.urlSlug = urlSlug;

exports.validate = function(name) {
  const isValid = validate(name).validForNewPackages;
  if (!isValid) return 'Invalid npm package name: ' + name;
  return isValid;
};

/**
 * Adds a backslash to the start of the word if not already present
 * @param {string} httpPath
 */
exports.prependBackslash = httpPath => httpPath.replace(/^\/?/, '/');

/**
 * Validates whether a given string is a valid url slug or not.
 * Allows slugs with backslash in front of them to be validated as well
 * @param {string} name Slug to validate
 */
exports.validateUrlSlug = function(name) {
  const backslashIfNeeded = name.charAt(0) === '/' ? '/' : '';
  if (backslashIfNeeded === '/') {
    name = name.substr(1);
  }
  const separators = ['-', '.', '_', '~', ''];
  const possibleSlugs = separators.map(separator =>
    urlSlug(name, separator, false),
  );
  if (!possibleSlugs.includes(name))
    return `Invalid url slug. Suggested slug: ${backslashIfNeeded}${
      possibleSlugs[0]
    }`;
  return true;
};

/**
 * Extends conflicter so that it keeps track of conflict status
 */
exports.StatusConflicter = class StatusConflicter extends Conflicter {
  constructor(adapter, force) {
    super(adapter, force);
    this.generationStatus = {}; // keeps track of file conflict history
  }

  checkForCollision(filepath, contents, callback) {
    super.checkForCollision(filepath, contents, (err, status) => {
      let filename = filepath.split('/').pop();
      this.generationStatus[filename] = status;
      callback(err, status);
    });
  }
};

/**
 * Find all artifacts in the given path whose type matches the provided
 * filetype.
 * For example, a fileType of "model" will search the target path for matches to
 * "*.model.js"
 * @param {string} path The directory path to search. This search is *not*
 * recursive.
 * @param {string} artifactType The type of the artifact in string form.
 * @param {Function=} reader An optional reader function to retrieve the
 * paths. Must return a Promise.
 * @returns {Promise<string[]>} The filtered list of paths.
 */
exports.findArtifactPaths = function(path, artifactType, reader) {
  const readdir = reader || readdirAsync;
  debug(`Finding artifact paths at: ${path}`);
  // Wrapping readdir in case it's not a promise.
  return Promise.resolve(readdir(path)).then(files => {
    return _.filter(files, f => {
      return (
        _.endsWith(f, `${artifactType}.js`) ||
        _.endsWith(f, `${artifactType}.ts`)
      );
    });
  });
};
/**
 * Parses the files of the target directory and returns matching JavaScript
 * or TypeScript artifact files. NOTE: This function does not examine the
 * contents of these files!
 * @param {string} dir The target directory from which to load artifacts.
 * @param {string} artifactType The artifact type (ex. "model", "repository")
 * @param {boolean} addSuffix Whether or not to append the artifact type to the
 * results. (ex. [Foo,Bar] -> [FooRepository, BarRepository])
 * @param {Function} reader An alternate function to replace the promisified
 * fs.readdir (useful for testing and for custom overrides).
 */
exports.getArtifactList = function(dir, artifactType, addSuffix, reader) {
  return exports.findArtifactPaths(dir, artifactType, reader).then(paths => {
    debug(`Filtering artifact paths: ${paths}`);
    return paths.map(p => {
      const result = _.first(_.split(_.last(_.split(p, path.sep)), '.'));
      //
      return addSuffix
        ? exports.toClassName(result) + exports.toClassName(artifactType)
        : exports.toClassName(result);
    });
  });
};

/**
 * Check package.json and dependencies.json to find out versions for generated
 * dependencies
 */
exports.getDependencies = function() {
  const pkg = require('../package.json');
  let version = pkg.version;
  // First look for config.loopbackVersion
  if (pkg.config && pkg.config.loopbackVersion) {
    version = pkg.config.loopbackVersion;
  }
  // Set it to be `^x.y.0`
  let loopbackVersion =
    '^' + semver.major(version) + '.' + semver.minor(version) + '.0';

  const deps = {};
  const dependencies = (pkg.config && pkg.config.templateDependencies) || {};
  for (const i in dependencies) {
    // Default to loopback version if the version for a given dependency is ""
    deps[i] = dependencies[i] || loopbackVersion;
  }
  return deps;
};

/**
 * Rename EJS files
 */
exports.renameEJS = function() {
  const renameStream = new stream.Transform({objectMode: true});

  renameStream._transform = function(file, enc, callback) {
    const filePath = file.relative;
    const dirname = path.dirname(filePath);
    let extname = path.extname(filePath);
    let basename = path.basename(filePath, extname);

    // extname already contains a leading '.'
    const fileName = `${basename}${extname}`;
    const result = fileName.match(/(.+)(.ts|.json|.js|.md)\.ejs$/);
    if (result) {
      extname = result[2];
      basename = result[1];
      file.path = path.join(file.base, dirname, basename + extname);
    }
    callback(null, file);
  };

  return renameStream;
};

/**
 * Get a validate function for object/array type
 * @param {String} type 'object' OR 'array'
 */
exports.validateStringObject = function(type) {
  return function validate(val) {
    if (val === null || val === '') {
      return true;
    }

    const err = `The value must be a stringified ${type}`;

    if (typeof val !== 'string') {
      return err;
    }

    try {
      var result = JSON.parse(val);
      if (type === 'array' && !Array.isArray(result)) {
        return err;
      }
    } catch (e) {
      return err;
    }

    return true;
  };
};
