// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const ArtifactGenerator = require('../../lib/artifact-generator');
const utils = require('../../lib/utils');

module.exports = class ControllerGenerator extends ArtifactGenerator {
  // Note: arguments and options should be defined in the constructor.
  constructor(args, opts) {
    super(args, opts);
  }

  _setupGenerator() {
    this.artifactInfo = {
      artifactType: 'controller',
      outdir: 'src/controllers/',
    };
    return super._setupGenerator();
  }

  checkLoopBackProject() {
    return super.checkLoopBackProject();
  }

  promptArtifactName() {
    return super.promptArtifactName();
  }

  scaffold() {
    return super.scaffold();
  }
  end() {
    this.log();
    this.log(
      'Controller %s is now created in src/controllers/',
      this.artifactInfo.name
    );
  }
};
