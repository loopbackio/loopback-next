// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Constructor} from '@loopback/context';
import * as debugFactory from 'debug';
import * as path from 'path';
import {ArtifactOptions, Booter} from '../types';
import {discoverFiles, loadClassesFromFiles} from './booter-utils';

const debug = debugFactory('loopback:boot:base-artifact-booter');

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
  glob: string;

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
    this.dirs = this.options.dirs
      ? Array.isArray(this.options.dirs)
        ? this.options.dirs
        : [this.options.dirs]
      : [];

    this.extensions = this.options.extensions
      ? Array.isArray(this.options.extensions)
        ? this.options.extensions
        : [this.options.extensions]
      : [];

    const joinedDirs = this.dirs.join('|');
    const joinedExts = this.extensions.join('|');

    this.glob = this.options.glob
      ? this.options.glob
      : `/@(${joinedDirs})/${
          this.options.nested ? '**/*' : '*'
        }@(${joinedExts})`;
  }

  /**
   * Discover files based on the 'glob' property relative to the 'projectRoot'.
   * Discovered artifact files matching the pattern are saved to the
   * 'discovered' property.
   */
  async discover() {
    debug(
      'Discovering %s artifacts in %j using glob %j',
      this.artifactName,
      this.projectRoot,
      this.glob,
    );

    this.discovered = await discoverFiles(this.glob, this.projectRoot);

    if (debug.enabled) {
      debug(
        'Artifact files found: %s',
        JSON.stringify(
          this.discovered.map(f => path.relative(this.projectRoot, f)),
          null,
          2,
        ),
      );
    }
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
