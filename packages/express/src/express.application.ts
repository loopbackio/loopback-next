// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/express
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, ApplicationConfig} from '@loopback/core';
import {ExpressServer} from './express.server';

/**
 * A LoopBack application with Express server
 */
export class ExpressApplication extends Application {
  /**
   * Embedded Express Server
   */
  readonly expressServer: ExpressServer;

  constructor(readonly config?: ApplicationConfig) {
    super(config);
    const binding = this.server(ExpressServer);
    this.expressServer = this.getSync(binding.key);
  }
}
