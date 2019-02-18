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

  scaffold() {
    // We don't want to call the base scaffold function since it copies
    // all of the templates!
    // we can set here additional specific this.artifactInfo.xxx parameters if needed

    return;
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
