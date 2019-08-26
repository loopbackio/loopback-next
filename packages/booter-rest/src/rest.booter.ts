// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/booter-rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  ArtifactOptions,
  BaseArtifactBooter,
  BootBindings,
  booter,
} from '@loopback/boot';
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
  MODEL_API_BUILDER_PLUGINS,
} from '@loopback/model-api-builder';
import {ApplicationWithRepositories, Model} from '@loopback/repository';
import * as debugFactory from 'debug';
import * as fs from 'fs';
import * as path from 'path';
import {promisify} from 'util';

const debug = debugFactory('loopback:boot:rest-booter');
const readFile = promisify(fs.readFile);

@booter('rest')
@extensionPoint(MODEL_API_BUILDER_PLUGINS)
export class RestBooter extends BaseArtifactBooter {
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

  async setupModel(configFile: string): Promise<void> {
    const cfg = JSON.parse(await readFile(configFile, {encoding: 'utf-8'}));
    debug(
      'Loaded model config from %s',
      path.relative(this.projectRoot, configFile),
      cfg,
    );

    const modelClass = await this.app.get<typeof Model & {prototype: Model}>(
      `models.${cfg.model}`,
    );

    const builder = await this.getApiBuilderForPattern(cfg.pattern);
    await builder.setup(this.app, modelClass, cfg);
  }

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
  // public-models should live outside of "dist"
  rootDir: '../',
  dirs: ['public-models'],
  extensions: ['.config.json'],
  nested: true,
};
