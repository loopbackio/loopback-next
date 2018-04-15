// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const yeoman = require('yeoman-environment');
const path = require('path');
const helpers = require('yeoman-test');
const fs = require('fs');

exports.testSetUpGen = function(genName, arg) {
  arg = arg || {};
  const env = yeoman.createEnv();
  const name = genName.substring(genName.lastIndexOf(path.sep) + 1);
  env.register(genName, 'loopback4:' + name);
  return env.create('loopback4:' + name, arg);
};

/**
 * Execute the generator via yeoman-test's run() helper,
 * detect exitGeneration flag and convert it into promise rejection.
 *
 * @param {string} GeneratorOrNamespace
 * @param {object} [settings]
 */
exports.executeGenerator = function(GeneratorOrNamespace, settings) {
  const runner = helpers.run(GeneratorOrNamespace, settings);

  // Override .then() and .catch() methods to detect our custom
  // "exit with error" handling
  runner.toPromise = function() {
    return new Promise((resolve, reject) => {
      this.on('end', () => {
        if (this.generator.exitGeneration instanceof Error) {
          reject(this.generator.exitGeneration);
        } else if (this.generator.exitGeneration) {
          reject(new Error(this.generator.exitGeneration));
        } else {
          resolve(this.targetDirectory);
        }
      });
      this.on('error', reject);
    });
  };

  return runner;
};

/**
 * Helper function for running the generator with custom inputs, artifacts,
 * and prompts.
 * @param {Generator} generator The generator to run.
 * @param {Object} prompts The prompts object to use with the generator under
 * test.
 * @param {Function} createArtifacts The create artifacts function. Takes
 * a directory. Use it to create folders and files for your tests.
 */
exports.runGeneratorWith = function runGeneratorWith(
  generator,
  prompts,
  createArtifacts
) {
  return exports
    .executeGenerator(generator)
    .inTmpDir(dir => {
      createArtifacts(dir);
    })
    .withPrompts(prompts);
};
/**
 * Setup the target directory with the required package.json and folder
 * structure.
 * @param {string} tmpDir Path to the temporary directory to setup
 * @param {object} options
 * @property {boolean} omitModelDir Do not create "models" directory
 * @property {boolean} omitRepositoryDir Do not create "repositories" directory
 * @property {boolean} omitControllerDir Do not create "controllers" directory
 */
exports.givenAnApplicationDir = function(tmpDir, options) {
  options = options || {};
  const srcDir = path.join(tmpDir, 'src');
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({
      keywords: ['loopback'],
    })
  );
  fs.mkdirSync(srcDir);
  if (!options.omitModelDir) {
    fs.mkdirSync(path.join(srcDir, 'models'));
  }
  if (!options.omitRepositoryDir) {
    fs.mkdirSync(path.join(srcDir, 'repositories'));
  }
  if (!options.omitControllerDir) {
    fs.mkdirSync(path.join(srcDir, 'controllers'));
  }
};

/**
 * Return the default path for the specified repository and temp directory.
 * @param {string=} tmpDir The temporary directory path. If omitted, the
 * returned path will be relative (prefixed with either "/" or "\",
 * @param {string} fileName The repository name.
 */
exports.givenARepositoryPath = function(tmpDir, fileName) {
  return exports.givenAnArtifactPath(tmpDir, 'repositories', fileName);
};

/**
 * Return the default path for the specified model and temp directory.
 * @param {string=} tmpDir The temporary directory path. If omitted, the
 * returned path will be relative (prefixed with either "/" or "\",
 * depending on OS).
 * @param {string} fileName The model name.
 */
exports.givenAModelPath = function(tmpDir, fileName) {
  return exports.givenAnArtifactPath(tmpDir, 'models', fileName);
};

/**
 * Return the default path for the specified controller and temp directory.
 * @param {string=} tmpDir The temporary directory path. If omitted, the
 * returned path will be relative (prefixed with either "/" or "\",
 * depending on OS).
 * @param {string} fileName The controller name.
 */
exports.givenAControllerPath = function(tmpDir, fileName) {
  return exports.givenAnArtifactPath(tmpDir, 'controllers', fileName);
};

/**
 * @param {string=} tmpDir The temporary directory path. If omitted, the
 * returned path will be relative (prefixed with either "/" or "\",
 * depending on OS).
 * @param {string} artifactDir The artifact directory name.
 * @param {string} fileName The artifact fileName.
 */
exports.givenAnArtifactPath = function(tmpDir, artifactDir, fileName) {
  if (!tmpDir) tmpDir = path.sep; // To allow use for relative pathing.
  return path.join(tmpDir, 'src', artifactDir, fileName);
};
