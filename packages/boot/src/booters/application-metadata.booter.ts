// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, CoreBindings, inject} from '@loopback/core';
import debugModule from 'debug';
import path from 'path';
import {BootBindings} from '../keys';
import {Booter} from '../types';

const debug = debugModule('loopback:boot:booter:application-metadata');

/**
 *
 * Configure the application with metadata from `package.json`
 *
 * @param app - Application instance
 * @param projectRoot - Root of User Project
 */
export class ApplicationMetadataBooter implements Booter {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) public app: Application,
    @inject(BootBindings.PROJECT_ROOT) private projectRoot: string,
  ) {}

  async configure() {
    try {
      // `this.projectRoot` points to `<project>/dist`
      const pkg = require(path.resolve(this.projectRoot, '../package.json'));
      this.app.setMetadata(pkg);
    } catch (err) {
      debug('package.json not found', err);
    }
  }
}
