// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/dist-util
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');

function getDist() {
  const nodeMajorVersion = +process.versions.node.split('.')[0];
  if (nodeMajorVersion < 8) {
    throw new Error(
      `Node.js version ${process.versions.node} is not supported.` +
        'Please use Node.js 8.9 or newer.',
    );
  }
  return nodeMajorVersion >= 10 ? './dist10' : './dist8';
}

function loadDist(projectRootDir) {
  const dist = getDist();
  return require(path.join(projectRootDir, dist));
}

module.exports = {getDist, loadDist};
