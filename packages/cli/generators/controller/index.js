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
      type: 'controller',
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
    // this.fs.move breaks if the first two args are the same
    if (this.artifactInfo.name === this.artifactInfo.defaultName) {
      return super.scaffold();
    }
    super.scaffold();
    this.fs.move(
      this.destinationPath(this.artifactInfo.outdir + 'new.controller.ts'),
      this.destinationPath(
        this.artifactInfo.outdir +
          utils.kebabCase(this.artifactInfo.name) +
          '.controller.ts'
      ),
      {globOptions: {dot: true}}
    );
    return;
  }

  end() {
    if (
      this.generationStatus.controller !== 'skip' &&
      this.generationStatus.controller !== 'identical'
    ) {
      this.log();
      this.log(
        'Controller %s is now created in src/controllers/',
        this.artifactInfo.name
      );
    }
  }
};
