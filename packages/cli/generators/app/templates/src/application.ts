import {Application, ApplicationConfig} from '@loopback/core';
import {RestComponent, RestServer} from '@loopback/rest';
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
    this.server(RestServer);
    this.setupControllers();
  }

  async start() {
    const server = await this.getServer(RestServer);
    const port = await server.get('rest.port');
    console.log(`Server is running at http://127.0.0.1:${port}`);
    console.log(`Try http://127.0.0.1:${port}/ping`);
    return await super.start();
  }

  setupControllers() {
    this.controller(PingController);
  }
}
