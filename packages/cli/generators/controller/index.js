// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const ArtifactGenerator = require('../../lib/artifact-generator');
const debug = require('../../lib/debug')('controller-generator');
const inspect = require('util').inspect;
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
    if (debug.enabled) {
      debug(`artifactInfo: ${inspect(this.artifactInfo)}`);
    }
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
    if (this.shouldExit()) return false;
    this.artifactInfo.filename =
      utils.kebabCase(this.artifactInfo.name) + '.controller.ts';
    if (debug.enabled) {
      debug(`Artifact filename set to: ${this.artifactInfo.filename}`);
    }
    // renames the file
    const source = this.destinationPath(
      this.artifactInfo.outdir + 'controller-template.ts'
    );
    const dest = this.destinationPath(
      this.artifactInfo.outdir + this.artifactInfo.filename
    );
    if (debug.enabled) {
      debug(`Copying artifact to: ${dest}`);
    }
    this.fs.move(source, dest, {globOptions: {dot: true}});
    return;
  }

  end() {
    super.end();
    if (this.shouldExit()) return false;
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
