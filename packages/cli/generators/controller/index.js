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
    super.scaffold();
    this.artifactInfo.filename =
      utils.kebabCase(this.artifactInfo.name) + '.controller.ts';

    // renames the file
    this.fs.move(
      this.destinationPath(this.artifactInfo.outdir + 'controller-template.ts'),
      this.destinationPath(
        this.artifactInfo.outdir + this.artifactInfo.filename
      ),
      {globOptions: {dot: true}}
    );
    return;
  }

  end() {
    // logs a message if there is no file conflict
    if (
      this.conflicter.generationStatus[this.artifactInfo.filename] !== 'skip' &&
      this.conflicter.generationStatus[this.artifactInfo.filename] !==
        'identical'
    ) {
      this.log();
      this.log(
        'Controller %s is now created in src/controllers/',
        this.artifactInfo.name
      );
    }
  }
};
