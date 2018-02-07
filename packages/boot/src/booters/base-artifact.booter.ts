// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Booter, BootOptions} from '@loopback/core';
import {Constructor} from '@loopback/context';
import {discoverFiles, loadClassesFromFiles} from './booter-utils';

/**
 * This class serves as a base class for Booters which follow a pattern of
 * configure, discover files in a folder(s) using explicit folder / extensions
 * or a glob pattern and lastly identifying exported classes from such files and
 * performing an action on such files such as binding them.
 *
 * Any Booter extending this base class is expected to set the 'options'
 * property to a object of ArtifactOptions type in the constructor after the
 * 'super' call.
 *
 * Provide it's own logic for 'load' after calling 'await super.load()' to
 * actually boot the Artifact classes.
 *
 * Currently supports the following boot phases: configure, discover, load
 *
 * @param bootConfig BootStrapper Config Options
 * @property options Options being used by the Booter (set in construtor)
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
  // tslint:disable-next-line:no-any
  classes: Array<Constructor<any>>;
  discoverFiles = discoverFiles;
  protected loadClassesFromFiles = loadClassesFromFiles;

  constructor(bootConfig: BootOptions) {
    this.projectRoot = bootConfig.projectRoot;
  }

  /**
   * Configure the Booter by initializing the 'dirs', 'extensions' and 'glob'
   * properties.
   *
   * NOTE: All properties are configured even if all aren't used.
   */
  async configure() {
    this.dirs = Array.isArray(this.options.dirs)
      ? this.options.dirs
      : [this.options.dirs];

    this.extensions = Array.isArray(this.options.extensions)
      ? this.options.extensions
      : [this.options.extensions];

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
    this.discovered = await this.discoverFiles(this.glob, this.projectRoot);
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
    this.classes = await this.loadClassesFromFiles(this.discovered);
  }
}

/**
 * Type definition for ArtifactOptions. These are the options supported by
 * this Booter.
 *
 * @param dirs String / String Array of directories to check for artifacts.
 * Paths must be relative. Defaults to ['controllers']
 * @param extensions String / String Array of file extensions to match artifact
 * files in dirs. Defaults to ['.controller.js']
 * @param nested Boolean to control if artifact discovery should check nested
 * folders or not. Default to true
 * @param glob  Optional. A `glob` string to use when searching for files. This takes
 * precendence over other options.
 */
export type ArtifactOptions = {
  dirs: string | string[];
  extensions: string | string[];
  nested: boolean;
  glob?: string;
};
