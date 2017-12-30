// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, ApplicationConfig} from '@loopback/core';
import {RestComponent} from '@loopback/rest';

import {BootMixin} from '../..';

export class BootTestApplication extends BootMixin(Application) {
  constructor(options?: ApplicationConfig) {
    // Allow options to replace the defined components array, if desired.
    options = Object.assign(
      {},
      {
        components: [RestComponent],
        rest: {
          port: 3333,
        },
      },
      options,
    );
    super(options);
  }
}

export class NormalApplication extends Application {
  constructor(options?: ApplicationConfig) {
    // Allow options to replace the defined components array, if desired.
    options = Object.assign(
      {},
      {
        components: [RestComponent],
        rest: {
          port: 3333,
        },
      },
      options,
    );
    super(options);
  }
}
