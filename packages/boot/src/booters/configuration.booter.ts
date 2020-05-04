// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  bind,
  BindingKey,
  BindingSpec,
  config,
  ContextTags,
  createBindingFromClass,
  inject,
  isProviderClass,
  ValueOrPromise,
} from '@loopback/context';
import {
  Application,
  CoreBindings,
  extensionFor,
  extensions,
} from '@loopback/core';
import debugFactory from 'debug';
import fs from 'fs';
import {safeLoad} from 'js-yaml';
import path from 'path';
import {promisify} from 'util';
import {BootBindings} from '../keys';
import {ArtifactOptions, booter} from '../types';
import {BaseArtifactBooter} from './base-artifact.booter';

const debug = debugFactory('loopback:boot:booter:configuration');
const readFile = promisify(fs.readFile);

export const CONFIGURATION_LOADERS = 'configuration.loaders';

export interface Configuration {
  [bindingKey: string]: unknown;
}

export interface ConfigurationLoader {
  fileExtensions?: string[];
  load(
    app: Application,
    projectRoot: string,
    files: string[],
  ): ValueOrPromise<Configuration>;
}

/**
 * A class that extends BaseArtifactBooter to boot the 'Configuration' artifact type.
 * Discovered Configurations are bound using `app.configure()`.
 *
 * Supported phases: configure, discover, load
 *
 * @param app - Application instance
 * @param projectRoot - Root of User Project relative to which all paths are resolved
 * @param bootConfig - Configuration Artifact Options Object
 */
@booter('configs')
export class ConfigurationBooter extends BaseArtifactBooter {
  @extensions.list(CONFIGURATION_LOADERS)
  private loaders: ConfigurationLoader[];

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    public app: Application,
    @inject(BootBindings.PROJECT_ROOT) projectRoot: string,
    @config()
    public configOptions: ArtifactOptions = {},
  ) {
    super(
      projectRoot,
      // Set Configuration Booter Options if passed in via bootConfig
      {...ConfigurationDefaults, ...configOptions},
    );
  }

  async configure() {
    const fileExtensions = new Set(
      this.options.extensions
        ? Array.isArray(this.options.extensions)
          ? [...this.options.extensions]
          : [this.options.extensions]
        : [],
    );

    this.loaders.forEach(loader => {
      const loaderExtensions = loader.fileExtensions;
      if (Array.isArray(loaderExtensions)) {
        for (const e of loaderExtensions) {
          fileExtensions.add(e);
        }
      }
    });
    this.options.extensions = Array.from(fileExtensions);
    await super.configure();

    debug('Dirs', this.dirs);
    debug('Extensions', this.extensions);
  }

  /**
   * Uses super method to get a list of Artifact classes. Boot each file by
   * creating a ConfigurationConstructor and binding it to the application class.
   */
  async load() {
    for (const loader of this.loaders) {
      debug(
        'Calling configuration loader %s for %j',
        loader.constructor.name,
        this.discovered,
      );
      const configs = await loader.load(
        this.app,
        this.projectRoot,
        this.discovered,
      );
      for (const key in configs) {
        const configData = configs[key];
        debug('Configuring binding %s with', key, configData);
        if (isProviderClass(configData)) {
          const binding = createBindingFromClass(configData, {
            key: BindingKey.buildKeyForConfig(key),
          }).tag({[ContextTags.CONFIGURATION_FOR]: key});
          this.app.add(binding);
        } else {
          this.app.configure(key).to(configData);
        }
      }
    }
  }
}

/**
 * Default ArtifactOptions for ConfigurationBooter.
 */
export const ConfigurationDefaults: ArtifactOptions = {
  dirs: ['configs'],
  extensions: ['.config.js', '.config.json', '.config.yaml', '.config.yml'],
  nested: true,
};

/**
 * A shortcut decorator `@configurationLoader` to mark a class as an extension
 * to `CONFIGURATION_LOADERS`.
 * @param specs - Additional binding specs
 */
export function configurationLoader(...specs: BindingSpec[]) {
  return bind(
    extensionFor(CONFIGURATION_LOADERS),
    {
      tags: {[ContextTags.NAMESPACE]: 'configurationLoaders'},
    },
    ...specs,
  );
}

/**
 * The default js/json/yaml/yaml configuration loader
 */
@configurationLoader()
export class JsYamlJsonLoader implements ConfigurationLoader {
  fileExtensions = [
    '.config.js',
    '.config.yaml',
    '.config.yml',
    '.config.json',
  ];

  async load(
    app: Application,
    projectRoot: string,
    files: string[],
  ): Promise<Configuration> {
    files = selectFiles(files, {
      extensionOrder: this.fileExtensions,
    });
    const data = {};
    for (const file of files) {
      debug('Loading file %s', file);
      if (file.endsWith('.js') || file.endsWith('.json')) {
        Object.assign(data, require(file));
      } else if (file.endsWith('.yml') || file.endsWith('.yaml')) {
        const content = await readFile(file, 'utf-8');
        Object.assign(data, safeLoad(content));
      }
    }
    return data;
  }
}

/**
 * Options to select files with the same the directory/base
 */
export interface FileSelectionOptions {
  /**
   * An array of file extensions to control the order of overriding. For example,
   * `['.js', '.json']` denotes that the `.js` file overrides the `.json` file.
   * If no items are provided, no overriding happens.
   */
  extensionOrder?: string[];
}

/**
 * Selects files based on the extension order
 * @param files - An array of file names
 * @param options - Options to control the overriding behavior
 */
function selectFiles(files: string[], options?: FileSelectionOptions) {
  const selected = [...files];
  const extensionOrder = options?.extensionOrder ?? [];
  selected.sort((a, b) => {
    const baseA = removeExtension(a, extensionOrder);
    const baseB = removeExtension(b, extensionOrder);
    if (baseA === baseB) {
      return extensionOrder.indexOf(baseA) - extensionOrder.indexOf(baseB);
    }
    return baseA.localeCompare(baseB);
  });
  debug('Sorted files', selected);
  const override = extensionOrder.length > 0;
  if (!override) return selected;
  const list: string[] = [];
  selected.reduce<string[]>((previousValue, currentValue) => {
    const base = removeExtension(currentValue, extensionOrder);
    debug('Checking file %s %s', currentValue, base);
    if (!previousValue.some(f => removeExtension(f, extensionOrder) === base)) {
      // No files in the list have the same base name as the current one
      previousValue.push(currentValue);
    }
    return previousValue;
  }, list);
  debug('Reduced files', list);
  return list;
}

/**
 * Remove file extension from the name
 * @param file - File name including the dirs
 * @param extensionOrder - An array of extension names to be checked
 */
function removeExtension(file: string, extensionOrder: string[]) {
  const dirName = path.dirname(file);
  for (const ext of extensionOrder) {
    const base = path.join(dirName, path.basename(file, ext));
    if (base !== file) return base;
  }
  return file;
}
