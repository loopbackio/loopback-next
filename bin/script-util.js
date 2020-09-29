// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const fs = require('fs-extra');
const assert = require('assert');

const Project = require('@lerna/project');

/**
 * Get a list of lerna packages with the optional filter function
 * @param {*} filter - Filter function
 */
async function getPackages(filter = () => true) {
  // List all packages within the monorepo
  const project = new Project(process.cwd());
  const packages = await project.getPackages();
  return packages.filter(filter);
}

/**
 * Load a lerna monorepo
 */
async function loadLernaRepo() {
  // List all packages within the monorepo
  const project = new Project(process.cwd());
  const packages = await project.getPackages();
  return {project, packages};
}

/**
 * Traverse all packages in the Lerna monrepo
 * @param {Function} processPackage - A function to process the package. It will
 * receive the package and project as two arguments.
 * @param {Function} filter - An optional function to filter packages
 */
async function traverseLernaRepo(processPackage, filter) {
  const {project, packages} = await loadLernaRepo();
  const filteredPackages = filter == null ? packages : packages.filter(filter);
  for (const pkg of filteredPackages) {
    await processPackage(pkg, project);
  }
}

/**
 * Write a json object into the file
 * @param {*} file - File path/name
 * @param {*} json - JSON object
 */
function writeJsonSync(file, json) {
  return fs.writeJsonSync(file, json, {encoding: 'utf-8', spaces: 2});
}

/**
 * Check if it's in `dryRun` mode
 * @param {*} options - Options object
 */
function isDryRun(options) {
  if (options != null) return !!options.dryRun;
  const dryRun = process.argv.slice(2).includes('--dry-run');
  return dryRun;
}

/**
 * Check if two json objects are equal
 * @param {*} obj1 - First json object
 * @param {*} obj2 - Second json object
 */
function isJsonEqual(obj1, obj2) {
  return obj1 === obj2 || JSON.stringify(obj1) === JSON.stringify(obj2);
}

/**
 * Clone a json object
 * @param {*} obj - json object
 */
function cloneJson(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Print stringified json
 * @param {*} obj - json object
 */
function printJson(obj) {
  console.log(stringifyJson(obj));
}

/**
 * Stringify JSON object
 * @param {*} obj - json object
 */
function stringifyJson(obj) {
  return JSON.stringify(obj, null, 2);
}

/**
 * Check if a package is TypeScript project
 * @param {object} pkg - Lerna package
 */
function isTypeScriptPackage(pkg) {
  return fs.existsSync(path.join(pkg.location, 'tsconfig.json'));
}

/**
 * Run a function if the module is the main entry for `node` process.
 *
 * @param currentModule - Current module. It's used to determine if the module
 * is the main entry script for `node`
 * @param {*} fn - An function. It can be sync or async. The return or resolved
 * value is handled as follows:
 * 1. `undefined` or `null`: exit the process with 0
 * 2. `true`: exit the process with 0
 * 3. `false`: exit the process with 1
 * 4. {exitCode: number}: exit the process with the given `exitCode`
 * 5. Print out the value and exit the process with 0.
 * @param {*} args - Arguments for the function
 */
function runMain(currentModule, fn, ...args) {
  assert(
    typeof currentModule === 'object' && currentModule.filename,
    'The first argument must be a module object',
  );
  assert(typeof fn === 'function', 'The second argument must be a function');
  // Only run the function if the module is the main entry script for `node`
  if (require.main !== currentModule) return;

  // Error handler
  const handleError = err => {
    console.error(err);
    process.exit(err.exitCode || 1);
  };

  // Return handler
  const handleReturn = val => {
    if (val != null) {
      if (val === true) return;
      if (val === false) {
        process.exit(1);
      }
      if (typeof val === 'object' && typeof val.exitCode === 'number') {
        process.exit(val.exitCode);
      } else {
        console.log(val);
      }
    }
  };
  let valueOrPromise;
  try {
    valueOrPromise = fn(...args);
    if (typeof valueOrPromise.then === 'function') {
      // Handle the promise
      valueOrPromise.then(handleReturn, handleError);
    } else {
      // Handle the return value
      handleReturn(valueOrPromise);
    }
  } catch (err) {
    // Handle error thrown synchronously
    handleError(err);
  }
}

exports.loadLernaRepo = loadLernaRepo;
exports.isDryRun = isDryRun;
exports.getPackages = getPackages;
exports.isJsonEqual = isJsonEqual;
exports.cloneJson = cloneJson;
exports.printJson = printJson;
exports.isTypeScriptPackage = isTypeScriptPackage;
exports.writeJsonSync = writeJsonSync;
exports.stringifyJson = stringifyJson;
exports.traverseLernaRepo = traverseLernaRepo;
exports.runMain = runMain;
