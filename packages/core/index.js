// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const nodeMajorVersion = +process.versions.node.split('.')[0];
module.exports = nodeMajorVersion >= 7 ?
  require('./dist/src') :
  require('./dist6/src');
