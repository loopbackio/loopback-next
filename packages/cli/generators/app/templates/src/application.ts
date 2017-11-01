// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: <%= project.name %>
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, ApplicationConfig} from '@loopback/core';
import {RestComponent} from '@loopback/rest';
import {PingController} from './controllers/ping-controller';

export class <%= project.applicationName %> extends Application {
  constructor(options?: ApplicationConfig) {
    // Allow options to replace the defined components array, if desired.
    options = Object.assign(
      {},
      {
        components: [RestComponent],
      },
      options,
    );
    super(options);
    this.setupControllers();
  }

  setupControllers() {
    this.controller(PingController);
  }
}
