// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const yeoman = require('yeoman-environment');
const path = require('path');
const helpers = require('yeoman-test');
const fs = require('fs-extra');

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
 * Helper function for creating a LoopBack 4 Project Directory for
 * testing.
 *
 * @param {string} rootDir Root directory in which to create the project
 * @param {Object} options
 * @property {boolean} excludeLoopbackCore Excludes the '@loopback/core' dependency in package.json
 * @property {boolean} excludePackageJSON Excludes package.json
 * @property {boolean} excludeYoRcJSON Excludes .yo-rc.json
 * @property {boolean} excludeControllersDir Excludes the controllers directory
 * @property {boolean} excludeModelsDir Excludes the models directory
 * @property {boolean} excludeRepositoriesDir Excludes the repositories directory
 * @property {boolean} excludeDataSourcesDir Excludes the datasources directory
 * @property {boolean} includeDummyModel Creates a dummy model file in /src/models/product-review.model.ts
 * @property {boolean} includeDummyRepository Creates a dummy repository file in /src/repositories/bar.repository.ts
 * @property {boolean} includeSandboxFilesFixtures creates files specified in SANDBOX_FILES array
 * @param {array} additionalFiles specify files, directories and their content to be included as fixtures
 */
exports.givenLBProject = function(rootDir, options) {
  options = options || {};
  const sandBoxFiles = options.additionalFiles || [];

  const content = {
    dependencies: {
      '@loopback/core': '*',
    },
  };

  // We infer if a project is loopback by checking whether its dependencies includes @loopback/core or not.
  // This flag is created for testing invalid loopback projects.
  if (options.excludeLoopbackCore) {
    delete content.dependencies['@loopback/core'];
  }

  if (!options.excludePackageJSON) {
    fs.writeFileSync(
      path.join(rootDir, 'package.json'),
      JSON.stringify(content),
    );
  }

  if (!options.excludeYoRcJSON) {
    fs.writeFileSync(path.join(rootDir, '.yo-rc.json'), JSON.stringify({}));
  }

  fs.mkdirSync(path.join(rootDir, 'src'));

  if (!options.excludeControllersDir) {
    fs.mkdirSync(path.join(rootDir, 'src', 'controllers'));
  }

  if (!options.excludeModelsDir) {
    fs.mkdirSync(path.join(rootDir, 'src', 'models'));
  }

  if (!options.excludeRepositoriesDir) {
    fs.mkdirSync(path.join(rootDir, 'src', 'repositories'));
  }

  if (!options.excludeDataSourcesDir) {
    fs.mkdirSync(path.join(rootDir, 'src', 'datasources'));
  }

  if (options.includeDummyModel) {
    const modelPath = path.join(rootDir, '/src/models/product-review.model.ts');
    fs.writeFileSync(modelPath, '--DUMMY VALUE--');
  }

  if (options.includeDummyRepository) {
    const repoPath = path.join(rootDir, '/src/repositories/bar.repository.ts');
    fs.writeFileSync(repoPath, '--DUMMY VALUE--');
  }

  if (sandBoxFiles.length > 0) {
    for (const theFile of sandBoxFiles) {
      const fullPath = path.join(rootDir, theFile.path, theFile.file);
      if (!fs.existsSync(fullPath)) {
        fs.ensureDirSync(path.dirname(fullPath));
        fs.writeFileSync(fullPath, theFile.content);
      }
    }
  }
};
