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
const readline = require('readline');
var semver = require('semver');
const regenerate = require('regenerate');
const _ = require('lodash');
const pascalCase = require('change-case').pascalCase;
const lowerCase = require('change-case').lowerCase;
const promisify = require('util').promisify;
const camelCase = require('change-case').camelCase;
const pluralize = require('pluralize');
const urlSlug = require('url-slug');
const validate = require('validate-npm-package-name');
const Conflicter = require('yeoman-generator/lib/util/conflicter');
const connectors = require('../generators/datasource/connectors.json');

const readdirAsync = promisify(fs.readdir);

const RESERVED_PROPERTY_NAMES = ['constructor'];

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
  return pascalCase(name);
};

exports.lowerCase = lowerCase;
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
exports.findArtifactPaths = async function(path, artifactType, reader) {
  const readdir = reader || readdirAsync;
  debug(`Finding artifact paths at: ${path}`);

  // Wrapping readdir in case it's not a promise.
  const files = await readdir(path);
  return _.filter(files, f => {
    return (
      _.endsWith(f, `${artifactType}.js`) || _.endsWith(f, `${artifactType}.ts`)
    );
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
exports.getArtifactList = async function(dir, artifactType, addSuffix, reader) {
  const paths = await exports.findArtifactPaths(dir, artifactType, reader);
  debug(`Filtering artifact paths: ${paths}`);
  return paths.map(p => {
    const firstWord = _.first(_.split(_.last(_.split(p, path.sep)), '.'));
    const result = pascalCase(exports.toClassName(firstWord));
    return addSuffix
      ? exports.toClassName(result) + exports.toClassName(artifactType)
      : exports.toClassName(result);
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
    const result = fileName.match(/(.+)(.ts|.json|.js|.md|.html)\.ejs$/);
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

/**
 * Use readline to read text from stdin
 */
exports.readTextFromStdin = function() {
  const rl = readline.createInterface({
    input: process.stdin,
  });

  const lines = [];
  let err;
  return new Promise((resolve, reject) => {
    rl.on('SIGINT', () => {
      err = new Error('Canceled by user');
      rl.close();
    })
      .on('line', line => {
        if (line === 'EOF') {
          rl.close();
        } else {
          lines.push(line);
        }
      })
      .on('close', () => {
        if (err) reject(err);
        else resolve(lines.join('\n'));
      })
      .on('error', e => {
        err = e;
        rl.close();
      });
  });
};

/*
 * Validate property name
 * @param {String} name The user input
 * @returns {String|Boolean}
 */
exports.checkPropertyName = function(name) {
  var result = exports.validateRequiredName(name);
  if (result !== true) return result;
  if (RESERVED_PROPERTY_NAMES.includes(name)) {
    return `${name} is a reserved keyword. Please use another name`;
  }
  return true;
};

/**
 * Validate required name for properties, data sources, or connectors
 * Empty name could not pass
 * @param {String} name The user input
 * @returns {String|Boolean}
 */
exports.validateRequiredName = function(name) {
  if (!name) {
    return 'Name is required';
  }
  return validateValue(name, /[\/@\s\+%:\.]/);
};

function validateValue(name, unallowedCharacters) {
  if (!unallowedCharacters) {
    unallowedCharacters = /[\/@\s\+%:\.]/;
  }
  if (name.match(unallowedCharacters)) {
    return `Name cannot contain special characters ${unallowedCharacters}: ${name}`;
  }
  if (name !== encodeURIComponent(name)) {
    return `Name cannot contain special characters escaped by encodeURIComponent: ${name}`;
  }
  return true;
}
/**
 *  Returns the modelName in the directory file format for the model
 * @param {string} modelName
 */
exports.getModelFileName = function(modelName) {
  return `${_.kebabCase(modelName)}.model.ts`;
};

/**
 * Returns the repositoryName in the directory file format for the repository
 * @param {string} repositoryName
 */
exports.getRepositoryFileName = function(repositoryName) {
  return `${_.kebabCase(repositoryName)}.repository.ts`;
};

/**
 * Returns the serviceName in the directory file format for the service
 * @param {string} serviceName
 */
exports.getServiceFileName = function(serviceName) {
  return `${_.kebabCase(serviceName)}.service.ts`;
};

/**
 * Returns the observerName in the directory file format for the observer
 * @param {string} observerName
 */
exports.getObserverFileName = function(observerName) {
  return `${_.kebabCase(observerName)}.observer.ts`;
};

/**
 *
 * Returns the connector property for the datasource file
 * @param {string} datasourcesDir path for sources
 * @param {string} dataSourceClass class name for the datasoure
 */
exports.getDataSourceConnectorName = function(datasourcesDir, dataSourceClass) {
  if (!dataSourceClass) {
    return false;
  }
  let result;
  let jsonFileContent;

  let datasourceJSONFile = path.join(
    datasourcesDir,
    exports.dataSourceToJSONFileName(dataSourceClass),
  );

  debug(`reading ${datasourceJSONFile}`);
  try {
    jsonFileContent = JSON.parse(fs.readFileSync(datasourceJSONFile, 'utf8'));
  } catch (err) {
    debug(`Error reading file ${datasourceJSONFile}: ${err.message}`);
    throw err;
  }

  if (jsonFileContent.connector) {
    result = jsonFileContent.connector;
  }
  return result;
};

/**
 *
 * load the connectors available and check if the basedModel matches any
 * connectorType supplied for the given connector name
 * @param {string} connectorType single or a comma separated string array
 * @param {string} datasourcesDir path for sources
 * @param {string} dataSourceClass class name for the datasoure
 */
exports.isConnectorOfType = function(
  connectorType,
  datasourcesDir,
  dataSourceClass,
) {
  debug(`calling isConnectorType ${connectorType}`);
  let jsonFileContent = '';

  if (!dataSourceClass) {
    return false;
  }

  let datasourceJSONFile = path.join(
    datasourcesDir,
    exports.dataSourceToJSONFileName(dataSourceClass),
  );

  debug(`reading ${datasourceJSONFile}`);
  try {
    jsonFileContent = JSON.parse(fs.readFileSync(datasourceJSONFile, 'utf8'));
  } catch (err) {
    debug(`Error reading file ${datasourceJSONFile}: ${err.message}`);
    throw err;
  }

  for (let connector of Object.values(connectors)) {
    const matchedConnector =
      jsonFileContent.connector === connector.name ||
      jsonFileContent.connector === `loopback-connector-${connector.name}`;

    if (matchedConnector) return connectorType.includes(connector.baseModel);
  }

  // Maybe for other connectors that are not in the supported list
  return null;
};

/**
 *
 * returns the name property inside the datasource json file
 * @param {string} datasourcesDir path for sources
 * @param {string} dataSourceClass class name for the datasoure
 */
exports.getDataSourceName = function(datasourcesDir, dataSourceClass) {
  if (!dataSourceClass) {
    return false;
  }
  let result;
  let jsonFileContent;

  let datasourceJSONFile = path.join(
    datasourcesDir,
    exports.dataSourceToJSONFileName(dataSourceClass),
  );

  debug(`reading ${datasourceJSONFile}`);
  try {
    jsonFileContent = JSON.parse(fs.readFileSync(datasourceJSONFile, 'utf8'));
  } catch (err) {
    debug(`Error reading file ${datasourceJSONFile}: ${err.message}`);
    throw err;
  }

  if (jsonFileContent.name) {
    result = jsonFileContent.name;
  }
  return result;
};

exports.dataSourceToJSONFileName = function(dataSourceClass) {
  return path.join(
    _.kebabCase(dataSourceClass.replace('Datasource', '')) + '.datasource.json',
  );
};

// literal strings with artifacts directory locations
exports.repositoriesDir = 'repositories';
exports.datasourcesDir = 'datasources';
exports.servicesDir = 'services';
exports.modelsDir = 'models';
exports.observersDir = 'observers';
exports.sourceRootDir = 'src';
