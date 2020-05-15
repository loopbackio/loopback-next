// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const BaseGenerator = require('../../lib/base-generator');
const artifacts = require('./artifacts');
const g = require('../../lib/globalize');
const fs = require('fs-extra');
const Project = require('@lerna/project');
const path = require('path');

module.exports = class KubernetesGenerator extends BaseGenerator {
  constructor(args, opts) {
    super(args, opts);
    this.isMonorepo = false;
    this.projectRoot = process.cwd();
    this.packages = [];
    this.isLoopBackExample = false;
    this.targetLocation = this.projectRoot;
    this.artifactsPath = path.join(this.projectRoot, '/kubernetes');
  }

  _setupGenerator() {
    this.argument('cloudNamespace', {
      type: String,
      required: false,
      description: g.f('k8s namespace'),
    });

    this.argument('helm', {
      type: Boolean,
      required: false,
      description: g.f('do you want to create helm charts ?'),
    });
  }

  async getCloudNamespace() {
    console.log(this.options['cloudNamespace']);
    console.log(this.options['helm']);
    if (this.options['cloudNamespace']) {
      this.namespace = this.options['cloudNamespace'];
      return;
    }
    let ans = await this.prompt([{
      type: 'input',
      name: 'namespace',
      message: g.f('Please enter the namespace of the kubernetes cluster'),
      default: 'default',
    }]);
    this.namespace = ans.namespace;
  }

  async checkMonoRepo() {
    this.isMonorepo = await fs.exists(
      path.join(this.projectRoot, 'lerna.json'),
    );
    if (this.isMonorepo) {
      const project = new Project(this.projectRoot);
      const packages = await project.getPackages();
      for (const p of packages) {
        this.packages.push({
          name: p.name,
          location: p.location,
        });
      }
    }
  }

  async checkSinglePackage() {
    const pkgJson = await fs.readJSON(
      path.join(this.projectRoot, 'package.json'),
    );
    if (!this.isMonorepo) {
      this.packages.push({
        name: pkgJson.name,
        location: this.projectRoot,
      });
    }
    this.appName = pkgJson.name;
  }

  async isHelmRequired() {
    if (this.options['helm']) {
      this.isHelmCharts = this.options['helm'];
    } else {
      let ans = await this.prompt([{
        type: 'confirm',
        name: 'helm',
        message: g.f('do you want to create helm charts ?'),
        default: 'default',
      }]);
      this.isHelmCharts = ans.helm;
    }
    if (this.isHelmCharts) {
      this.targetLocation = path.join(this.projectRoot, '/helm');
      this.artifactsPath = path.join(this.targetLocation, '/templates');
    }
    await fs.mkdirp(this.targetLocation);
    await fs.mkdirp(this.artifactsPath);
  }

  async scaffold() {
    let templates = [];
    for (const pkg of this.packages) {
      let answers = await this.prompt([
        {
          type: 'input',
          name: 'name',
          message: g.f(
            'Please enter the deployment spec name for the package %s:',
            `${pkg.name}`,
          ),
          default: pkg.name,
        },
        {
          type: 'list',
          name: 'serviceType',
          choices: ['ClusterIP', 'NodePort', 'None'],
          message: g.f(
            'Please select the service type for the deployment of %s:',
            `${pkg.name}`,
          ),
          default: 'NodePort',
        },
        {
          type: 'input',
          name: 'dockerImage',
          message: g.f(
            'Please enter the docker image name of %s:',
            `${pkg.name}`,
          ),
          default: pkg.name,
        },
        {
          type: 'input',
          name: 'dockerImageVersion',
          message: g.f(
            'Please enter the docker image version of %s:',
            `${pkg.name}`,
          ),
          default: `1.0.0`,
        },
        {
          type: 'input',
          name: 'containerPort',
          message: g.f(
            'Please enter the container port of %s:',
            `${pkg.name}`,
          ),
          default: 3000,
        },
        {
          type: 'input',
          name: 'servicePort',
          message: g.f(
            'Please enter the service port of %s:',
            `${pkg.name}`,
          ),
          default: 3000,
        }
      ]);
      templates.push({
        namespace: this.namespace,
        name: answers.name,
        image: answers.dockerImage + ':' + answers.dockerImageVersion,
        isClusterIp: answers.serviceType === 'ClusterIP',
        isNodePort: answers.serviceType === 'NodePort',
        isHeadlessService: answers.serviceType === 'None',
        type: answers.serviceType,
        port: answers.servicePort,
        targetPort: answers.containerPort
      });
    }
    let images = {};
    for (let template of templates) {
      if (this.isHelmCharts) {
         images[template.name] = template.image
         template.image = `.Values.images.${template.name}`;
      }
      await artifacts.generateKubernetes(this.artifactsPath, template);
    }
    if (this.isHelmCharts) {
      await artifacts.generateHelm(this.targetLocation, this.appName, images);
    }
  }

  async end() {
    await super.end();
  }
};
