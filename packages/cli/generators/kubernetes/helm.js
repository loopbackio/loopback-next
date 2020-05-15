// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

module.exports.chart = function (name) {
  return {
    apiVersion: "v1",
    appVersion: "1.0",
    description: `A helm chart for ${name}`,
    name: name,
    tillerVersion: '>=2.12.0',
    version: "1.0.0",
  };
};

module.exports.values = function (images) {
  return {
    replicaCount: 1,
    resources: {},
    images: images
  };
};
