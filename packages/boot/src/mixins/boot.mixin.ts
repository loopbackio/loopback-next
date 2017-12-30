// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {discoverArtifactFiles} from '../utils';
import {resolve} from 'path';
import {Constructor} from '@loopback/context';
import {StringOrArr} from '../types';
const debug = require('debug')('@loopback/boot:mixin');

/**
 * A mixin class for Application that boots it. Boot automatically
 * binds controllers based on convention based naming before starting
 * the Application.
 *
 * ```ts
 * class MyApp extends BootMixin(Application) {}
 * ```
 */
// tslint:disable-next-line:no-any
export function BootMixin<T extends Constructor<any>>(superClass: T) {
  return class extends superClass {
    // tslint:disable-next-line:no-any
    constructor(...args: any[]) {
      super(...args);

      // Create Options Object / Init Defaults if non-existent!
      if (!this.options) this.options = {};
      if (!this.options.boot) {
        this.options.boot = {};
      }

      // Set `dist/src` as rootDir (as a relative path) if not set by user
      if (!this.options.boot.rootDir) {
        this.options.boot.rootDir = 'dist/src';
      }

      // Resolve to Absolute path! This is done here so user can provide
      // relative path or absolute path for rootDir.
      this.options.boot.rootDir = resolve(this.options.boot.rootDir);
    }

    /**
     * Default function to boot Application. Boot is the process of discovering
     * and binding artifacts automatically to a given key.
     */
    async boot() {
      this.bootControllers();
      // This allows boot to work regardless of Mixin order
      if (super.boot) await super.boot();
    }

    /**
     * Override the start function to boot before running start!
     */
    async start() {
      await this.boot();
      super.start();
    }

    /**
     * Boot controllers automatically by finding them in given directories
     * and binding them using this.controller() function.
     */
    bootControllers() {
      // Default folder to look in (relative to rootDir)
      const controllerDirs = this.options.boot.controllerDirs || 'controllers';

      // If custom extensions aren't passed, set default
      const controllerExts =
        this.options.boot.controllerExts || 'controller.js';

      // Controllers are Classes so this method can be used to discover
      // and boot Controllers
      this.bootClassArtifacts(controllerDirs, controllerExts, this.controller);
    }

    /**
     * If an artifact is
     *
     * @param dirs List of paths to search for Artifacts. (may be relative to
     * rootDir / basePath OR absolute paths)
     * @param exts List of extensions files discovered should match
     * @param prefixOrFunc String prefix if using a `bind.toClass` or a function
     * for custom binding logic
     * @param nested Should nested directories in dirs be searched for Artifacts
     * @param basePath Override rootDir (for prefixing to relative paths)
     */
    bootClassArtifacts(
      dirs: StringOrArr,
      exts: StringOrArr,
      prefixOrFunc: string | Function,
      nested?: boolean,
      basePath?: string,
    ) {
      basePath = basePath || this.options.boot.rootDir;
      const files = discoverArtifactFiles(dirs, exts, nested, basePath);
      if (typeof prefixOrFunc === 'string') {
        this.bindClassArtifacts(files, prefixOrFunc);
      } else {
        this.bindClassArtifactsUsingFunction(files, prefixOrFunc);
      }
    }

    /**
     * Find classes in a list of files and bind them as a Class (to Application
     * Context) by generating a key using a prefix. Key is: prefix.className
     *
     * @param files List of files (absolute paths) to look for Classes in
     * @param prefix Prefix to generate the binding key (prefix.className)
     */
    bindClassArtifacts(files: string[], prefix: string) {
      files.forEach(file => {
        try {
          const ctrl = require(file);
          const classes: string[] = Object.keys(ctrl);

          classes.forEach((cls: string) =>
            // prettier-ignore
            this.bind(`${prefix}.${cls}`).toClass(ctrl[cls]).tag(prefix),
          );
        } catch (err) {
          debug(
            `bindClassArtifacts: Skipping file: ${file} because error: ${err}`,
          );
        }
      });
    }

    /**
     * Find classes in a list of files (absolute paths) and call the given
     * function with the Classes in the files given.
     * @param files List of files (absolute paths) to look for Classes in
     * @param fn Function to pass the Class in to so it can handle "booting" it
     */
    bindClassArtifactsUsingFunction(files: string[], fn: Function) {
      files.forEach(file => {
        try {
          const ctrl = require(file);
          const classes: string[] = Object.keys(ctrl);

          classes.forEach((cls: string) => fn.call(this, ctrl[cls]));
        } catch (err) {
          debug(
            `bindClassArtifactsUsingFunction: Skipping file: ${file} because error: ${err}`,
          );
        }
      });
    }
  };
}
