'use strict';

const ArtifactGenerator = require('../../lib/artifact-generator');
const utils = require('../../lib/utils');
const path = require('path');

module.exports = class RelationGenerator extends ArtifactGenerator {

  constructor(args, opts) {
    super(args, opts);
  }

  _setupGenerator() {
    this.artifactInfo = {
      type: 'relation',
      rootDir: utils.sourceRootDir,
      outDir: utils.sourceRootDir,
    };

    return super._setupGenerator();
  }

  helloWorld() {
    this.log("Hello World");
  }
}
