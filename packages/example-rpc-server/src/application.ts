import {Application, ApplicationConfig} from '@loopback/core';
import {RPCServer} from './servers/rpc-server';
import {GreetController} from './controllers';

export class MyApplication extends Application {
  options: ApplicationConfig;
  constructor(options?: ApplicationConfig) {
    // Allow options to replace the defined components array, if desired.
    super(options);
    this.controller(GreetController);
    this.server(RPCServer);
    this.options = options || {};
    this.options.port = this.options.port || 3000;
    this.bind('rpcServer.config').to(this.options);
  }

  async start() {
    await super.start();
    console.log(`Server is running on port ${this.options.port}`);
  }
}
