// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/v3compat
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BootBindings, Booter, discoverFiles} from '@loopback/boot';
import {Application, CoreBindings, inject} from '@loopback/core';
import * as debugFactory from 'debug';
import * as fs from 'fs';
import * as path from 'path';
import {promisify} from 'util';
import {Lb3Application} from '../core';

const fileExists = promisify(fs.exists);

const debug = debugFactory('loopback:v3compat:model-booter');

const DefaultOptions = {
  root: './legacy',
};

export class Lb3ModelBooter implements Booter {
  options: Lb3ModelBooterOptions;

  root: string;
  modelDefinitionsGlob: string;
  modelConfigFile: string;

  discoveredDefinitionFiles: string[];

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    public app: Application & {v3compat: Lb3Application},
    @inject(BootBindings.PROJECT_ROOT)
    public projectRoot: string,
    @inject(`${BootBindings.BOOT_OPTIONS}#v3compat`)
    options: Partial<Lb3ModelBooterOptions> = {},
  ) {
    this.options = Object.assign({}, DefaultOptions, options);
  }

  async configure?(): Promise<void> {
    this.root = path.join(this.projectRoot, this.options.root);
    this.modelDefinitionsGlob = '/models/*.json';
    this.modelConfigFile = 'model-config.json';
  }

  async discover?(): Promise<void> {
    debug(
      'Discovering LB3 model definitions in %j using glob %j',
      this.root,
      this.modelDefinitionsGlob,
    );

    const allFiles = await discoverFiles(this.modelDefinitionsGlob, this.root);
    this.discoveredDefinitionFiles = allFiles.filter(
      f => f[0] !== '_' && path.extname(f) === '.json',
    );
    debug(' -> %j', allFiles);
  }

  async load?(): Promise<void> {
    for (const f of this.discoveredDefinitionFiles) await this.loadModel(f);

    await this.configureModels();
  }

  private async loadModel(jsonFile: string) {
    const basename = path.basename(jsonFile, path.extname(jsonFile));
    const sourceDir = path.dirname(jsonFile);
    // TODO: support additional extensions like `.ts` and `.coffee`
    const sourceFile = path.join(sourceDir, `${basename}.js`);
    const sourceExists = await fileExists(sourceFile);

    debug(
      'Loading model from %j (%j)',
      path.relative(this.projectRoot, jsonFile),
      sourceExists
        ? path.relative(this.projectRoot, sourceFile)
        : '<no source code>',
    );

    const definition = require(jsonFile);
    const script = sourceExists ? require(sourceFile) : undefined;

    debug('  creating a new model %j', definition.name);
    const modelCtor = this.app.v3compat.registry.createModel(definition);

    if (typeof script === 'function') {
      debug(
        '  customizing model %j using %j',
        definition.name,
        path.relative(this.projectRoot, sourceFile),
      );
      script(modelCtor);
    } else if (sourceExists) {
      debug(
        '  skipping model file %s - `module.exports` is not a function',
        sourceFile,
      );
    }
  }

  private async configureModels() {
    const configFile = path.join(this.root, this.modelConfigFile);
    debug('Loading model-config from %j', configFile);

    const config = require(configFile);
    for (const modelName in config) {
      if (modelName === '_meta') continue;
      const modelConfig = config[modelName];
      debug('  configuring %j with %j', modelName, modelConfig);
      const modelCtor = this.app.v3compat.registry.getModel(modelName);
      this.app.v3compat.model(modelCtor, modelConfig);
    }
  }
}

export interface Lb3ModelBooterOptions {
  root: string;
}
