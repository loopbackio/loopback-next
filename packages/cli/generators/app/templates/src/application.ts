import {Application, ApplicationConfig} from '@loopback/core';
import {RestComponent} from '@loopback/rest';
import {PingController} from './controllers/ping.controller';

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
