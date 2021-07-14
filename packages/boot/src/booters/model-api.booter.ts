// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  config,
  CoreBindings,
  extensionPoint,
  extensions,
  Getter,
  inject,
} from '@loopback/core';
import {
  ModelApiBuilder,
  ModelApiConfig,
  MODEL_API_BUILDER_PLUGINS,
} from '@loopback/model-api-builder';
import {ApplicationWithRepositories} from '@loopback/repository';
import debugFactory from 'debug';
import * as path from 'path';
import {BootBindings} from '../keys';
import {ArtifactOptions, booter} from '../types';
import {BaseArtifactBooter} from './base-artifact.booter';

const debug = debugFactory('loopback:boot:model-api');

@booter('modelApi')
@extensionPoint(MODEL_API_BUILDER_PLUGINS)
export class ModelApiBooter extends BaseArtifactBooter {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    public app: ApplicationWithRepositories,
    @inject(BootBindings.PROJECT_ROOT) projectRoot: string,
    @extensions()
    public getModelApiBuilders: Getter<ModelApiBuilder[]>,
    @config()
    public booterConfig: ArtifactOptions = {},
  ) {
    // TODO assert that `app` has RepositoryMixin members

    super(
      projectRoot,
      // Set booter options if passed in via bootConfig
      Object.assign({}, RestDefaults, booterConfig),
    );
  }

  /**
   * Load the the model config files
   */
  async load(): Promise<void> {
    // Important: don't call `super.load()` here, it would try to load
    // classes via `loadClassesFromFiles` - that won't work for JSON files
    await Promise.all(
      this.discovered.map(async f => {
        try {
          // It's important to await before returning,
          // otherwise the catch block won't receive errors
          await this.setupModel(f);
        } catch (err) {
          const shortPath = path.relative(this.projectRoot, f);
          err.message += ` (while loading ${shortPath})`;
          throw err;
        }
      }),
    );
  }

  /**
   * Set up the loaded model classes
   */
  async setupModel(configFile: string): Promise<void> {
    const cfg: ModelApiConfig = require(configFile);
    debug(
      'Loaded model config from %s',
      path.relative(this.projectRoot, configFile),
      cfg,
    );

    const modelClass = cfg.model;
    if (typeof modelClass !== 'function') {
      throw new Error(
        `Invalid "model" field. Expected a Model class, found ${modelClass}`,
      );
    }

    const builder = await this.getApiBuilderForPattern(cfg.pattern);
    await builder.build(this.app, modelClass, cfg);
  }

  /**
   * Retrieve the API builder that matches the pattern provided
   * @param pattern - name of pattern for an API builder
   */
  async getApiBuilderForPattern(pattern: string): Promise<ModelApiBuilder> {
    const allBuilders = await this.getModelApiBuilders();
    const builder = allBuilders.find(b => b.pattern === pattern);
    if (!builder) {
      const availableBuilders = allBuilders.map(b => b.pattern).join(', ');
      throw new Error(
        `Unsupported API pattern "${pattern}". ` +
          `Available patterns: ${availableBuilders || '<none>'}`,
      );
    }
    return builder;
  }
}

/**
 * Default ArtifactOptions for ControllerBooter.
 */
export const RestDefaults: ArtifactOptions = {
  dirs: ['model-endpoints'],
  extensions: ['-config.js'],
  nested: true,
};
