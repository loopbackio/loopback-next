// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, ApplicationConfig, Server} from '@loopback/core';
import {RestComponent} from './rest-component';
import {SequenceHandler, SequenceFunction} from './sequence';
import {Binding, Constructor} from '@loopback/context';
import {format} from 'util';
import {RestBindings} from './keys';

export const ERR_NO_MULTI_SERVER = format(
  'RestApplication does not support multiple servers!',
  'To create your own server bindings, please extend the Application class.',
);

// To help cut down on verbosity!
export const SequenceActions = RestBindings.SequenceActions;

/**
 * An implementation of the Application class that automatically provides
 * an instance of a REST server. This application class is intended to be
 * a single-server implementation. Any attempt to bind additional servers
 * will throw an error.
 *
 */
export class RestApplication extends Application {
  constructor(config?: ApplicationConfig) {
    const cfg = Object.assign({}, config);
    super(cfg);
    this.component(RestComponent);
  }

  server(server: Constructor<Server>, name?: string): Binding {
    if (this.findByTag('server').length > 0) {
      throw new Error(ERR_NO_MULTI_SERVER);
    }
    return super.server(server, name);
  }

  sequence(sequence: Constructor<SequenceHandler>): Binding {
    return this.bind(RestBindings.SEQUENCE).toClass(sequence);
  }

  handler(handlerFn: SequenceFunction) {
    // FIXME(kjdelisle): I attempted to mimic the pattern found in RestServer
    // with no success, so until I've got a better way, this is functional.
    const server = this.getSync('servers.RestServer');
    server.handler(handlerFn);
  }
}
