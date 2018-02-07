// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {RestApplication} from '@loopback/rest';
import {ApplicationConfig, BootOptions} from '@loopback/core';
import {BootComponent} from '../../index';

export class ControllerBooterApp extends RestApplication {
  constructor(options?: ApplicationConfig) {
    super(options);
    this.component(BootComponent);
  }

  async boot(): Promise<void> {
    const bootOptions: BootOptions = {
      projectRoot: __dirname,
    };
    await super.boot(bootOptions);
  }

  async start() {
    await super.start();
  }
}
