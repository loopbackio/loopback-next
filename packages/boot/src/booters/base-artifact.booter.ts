// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Constructor} from '@loopback/core';
import debugFactory from 'debug';
import fs from 'fs';
import path from 'path';
import {ArtifactOptions, Booter} from '../types';
import {discoverFiles, loadClassesFromFiles} from './booter-utils';

const debug = debugFactory('loopback:boot:booter:base');

/**
 * This class serves as a base class for Booters which follow a pattern of
 * configure, discover files in a folder(s) using explicit folder / extensions
 * or a glob pattern and lastly identifying exported classes from such files and
 * performing an action on such files such as binding them.
 *
 * Any Booter extending this base class is expected to
 *
 * 1. Set the 'options' property to a object of ArtifactOptions type. (Each extending
 * class should provide defaults for the ArtifactOptions and use Object.assign to merge
 * the properties with user provided Options).
 * 2. Provide it's own logic for 'load' after calling 'await super.load()' to
 * actually boot the Artifact classes.
 *
 * Currently supports the following boot phases: configure, discover, load.
 *
 */
export class BaseArtifactBooter implements Booter {
  /**
   * Options being used by the Booter.
   */
  readonly options: ArtifactOptions;
  /**
   * Project root relative to which all other paths are resolved
   */
  readonly projectRoot: string;

  private packageRoot: string;

  /**
   * Relative paths of directories to be searched
   */
  dirs: string[];
  /**
   * File extensions to be searched
   */
  extensions: string[];
  /**
   * `glob` pattern to match artifact paths
   */
  globs: string[];

  /**
   * List of files discovered by the Booter that matched artifact requirements
   */
  discovered: string[];
  /**
   * List of exported classes discovered in the files
   */
  classes: Constructor<{}>[];

  constructor(projectRoot: string, options: ArtifactOptions) {
    this.projectRoot = projectRoot;
    this.options = options;
  }

  /**
   * Get the name of the artifact loaded by this booter, e.g. "Controller".
   * Subclasses can override the default logic based on the class name.
   */
  get artifactName(): string {
    return this.constructor.name.replace(/Booter$/, '');
  }

  /**
   * Configure the Booter by initializing the 'dirs', 'extensions' and 'glob'
   * properties.
   *
   * NOTE: All properties are configured even if all aren't used.
   */
  async configure() {
    const config = this.buildOptions(this.options);
    this.dirs = config.dirs;
    this.globs = config.globs;
    this.extensions = config.extensions;
  }

  /**
   * Build options for discovering files within the project
   * @param options - Options for the artifact
   */
  protected buildOptions(options: ArtifactOptions) {
    const config = {
      globs: [],
      extensions: [],
      dirs: [],
      ...options,
    };

    let dirs = asStringArray(options.dirs);
    const extensions = asStringArray(options.extensions);
    if (options.globs) {
      const globs = asStringArray(options.globs);
      return {...config, dirs, globs, extensions};
    }

    // Generated LoopBack applications use `<pkgRoot>/dist` as the `projectRoot`
    this.packageRoot = this.projectRoot;
    const pkgJsonFile = path.resolve(this.projectRoot, '../package.json');
    if (fs.existsSync(pkgJsonFile)) {
      // Use the parent directory containing `package.json` as the package root
      // so that we can use `dirs` such as `../configs`.
      this.packageRoot = path.resolve(this.projectRoot, '..');
    }
    // Now the root is either `''` or `'dist/'`
    dirs = dirs.map(d => {
      // Resolve the dir to be relative to the package root
      const dir = path.relative(
        this.packageRoot,
        path.resolve(this.projectRoot, d),
      );
      // Replace `\`
      return dir.replace(/\\/g, '/');
    });

    // Glob does not allow `@(configs|dist/configs)`
    // Organize dirs by common root
    const dirPatterns: Record<string, string[]> = {};
    dirs.reduce<Record<string, string[]>>(
      (previousValue: Record<string, string[]>, dir) => {
        const lastIndex = dir.lastIndexOf('/');
        let root = '';
        let name = dir;
        if (lastIndex !== -1) {
          root = dir.substring(0, lastIndex);
          name = dir.substring(lastIndex + 1);
        }
        previousValue[root] = previousValue[root] ?? [];
        previousValue[root].push(name);
        return previousValue;
      },
      dirPatterns,
    );

    const joinedExts = extensions.join('|');
    const globs: string[] = [];
    for (const root in dirPatterns) {
      const prefix = root === '' ? '/' : `/${root}/`;
      const joinedDirs = dirPatterns[root].join('|');
      const glob = `${prefix}@(${joinedDirs})/${
        options.nested ? '**/*' : '*'
      }@(${joinedExts})`;
      globs.push(glob);
    }

    return {...config, dirs, globs, extensions};
  }

  /**
   * Discover files based on the 'glob' property relative to the 'projectRoot'.
   * Discovered artifact files matching the pattern are saved to the
   * 'discovered' property.
   */
  async discover() {
    this.discovered = await this.discoverFiles(this.globs);
  }

  protected async discoverFiles(globs: string[]) {
    debug(
      'Discovering %s artifacts in %j using glob %j',
      this.artifactName,
      this.packageRoot,
      globs,
    );
    const listOfFiles = await Promise.all(
      globs.map(glob => discoverFiles(glob, this.packageRoot)),
    );
    const discovered = new Set<string>();
    for (const files of listOfFiles) {
      for (const f of files) {
        discovered.add(f);
      }
    }
    const result = Array.from(discovered);
    if (debug.enabled) {
      debug(
        'Artifact files found: %s',
        JSON.stringify(
          result.map(f => path.relative(this.packageRoot, f)),
          null,
          2,
        ),
      );
    }
    return result;
  }

  /**
   * Filters the exports of 'discovered' files to only be Classes (in case
   * function / types are exported) as an artifact is a Class. The filtered
   * artifact Classes are saved in the 'classes' property.
   *
   * NOTE: Booters extending this class should call this method (await super.load())
   * and then process the artifact classes as appropriate.
   */
  async load() {
    this.classes = loadClassesFromFiles(this.discovered, this.projectRoot);
  }
}

function asStringArray(val?: string | string[]) {
  if (val == null) return [];
  return Array.isArray(val) ? val : [val];
}
