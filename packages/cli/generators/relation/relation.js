'use strict';

const ArtifactGenerator = require('../../lib/artifact-generator');
const path = require('path');
const utils = require('../../lib/utils');

module.exports = class RelationGenerator extends ArtifactGenerator {
  constructor(args, opts) {
    super(args, opts);
  }

  _setupGenerator() {
    super._setupGenerator();
    this.artifactInfo = {
      type: 'relation',
      rootDir: utils.sourceRootDir,
    };

    this.artifactInfo.outDir = path.resolve(
      this.artifactInfo.rootDir,
      'controllers',
    );
    this.artifactInfo.modelDir = path.resolve(
      this.artifactInfo.rootDir,
      'models',
    );
    this.artifactInfo.repositoryDir = path.resolve(
      this.artifactInfo.rootDir,
      'repositories',
    );
  }

  generateAll(options) {
    this.generateControllers(options);
    this.generateModels(options);
  }

  generateControllers(options) {
    throw new Error('Not implemented');
  }

  generateModels(options) {
    throw new Error('Not implemented');
  }

  generateRepositories(options) {
    throw new Error('Not implemented');
  }
};
