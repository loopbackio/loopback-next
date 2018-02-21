// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Constructor} from '@loopback/context';
import {discoverFiles, loadClassesFromFiles} from './booter-utils';
import {Booter, ArtifactOptions} from '../interfaces';

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
 * Currently supports the following boot phases: configure, discover, load
 *
 * @property options Options being used by the Booter
 * @property projectRoot Project root relative to which all other paths are resovled
 * @property dirs Directories to look for an artifact in
 * @property extensions File extensions to look for to match an artifact (this is a convention based booter)
 * @property glob Glob pattern to use to discover artifacts. Takes precedence over (dirs + extensions)
 * @property discovered List of files discovered by the Booter that matched artifact requirements
 * @property classes List of exported classes discovered in the files
 */
export class BaseArtifactBooter implements Booter {
  /**
   * Options being used by the Booter.
   */
  options: ArtifactOptions;
  projectRoot: string;
  dirs: string[];
  extensions: string[];
  glob: string;
  discovered: string[];
  classes: Array<Constructor<{}>>;

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
    this.discovered = await discoverFiles(this.glob, this.projectRoot);
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
    this.classes = loadClassesFromFiles(this.discovered);
  }
}
