// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const deployment = require('./deployment');
const service = require('./service');
const helm = require('./helm');
const writeYaml = require('../../lib/utils').writeYaml;
const path = require('path');

module.exports.generateKubernetes = async function (kubeTemplatesLocation, values) {
  let deploymentSpec = await deployment.templateFn(values);
  let serviceSpec = await service.templateFn(values);
  await writeYaml(path.join(kubeTemplatesLocation, values.name + '-deployment.yaml'), deploymentSpec);
  await writeYaml(path.join(kubeTemplatesLocation, values.name + '-service.yaml'), serviceSpec);
};

module.exports.generateHelm = async function (helmChartLocation, chartName, images) {
  let chart = await helm.chart(chartName);
  let values = await helm.values(images);
  await writeYaml(path.join(helmChartLocation, 'Chart.yaml'), chart);
  await writeYaml(path.join(helmChartLocation, 'Values.yaml'), values);
};
