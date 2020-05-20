// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/example-rpc-server
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, ApplicationConfig} from '@loopback/core';
import {GreetController} from './controllers';
import {RPCServer} from './rpc.server';

export {ApplicationConfig};

export class MyApplication extends Application {
  options: ApplicationConfig;
  constructor(options: ApplicationConfig = {}) {
    // Allow options to replace the defined components array, if desired.
    super(options);
    this.controller(GreetController);
    this.server(RPCServer);
    this.options.port = this.options.port || 3000;
    this.bind('rpcServer.config').to(this.options);
  }
}
