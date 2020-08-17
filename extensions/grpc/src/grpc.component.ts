// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  Component,
  Constructor,
  CoreBindings,
  inject,
  ProviderMap,
  Server,
} from '@loopback/core';
import {GrpcSequence} from './grpc.sequence';
import {GrpcServer} from './grpc.server';
import {GrpcBindings} from './keys';
import {GeneratorProvider} from './providers/generator.provider';
import {ServerProvider} from './providers/server.provider';
import {GrpcService} from './types';
/**
 * Grpc Component for LoopBack 4.
 */
export class GrpcComponent implements Component {
  /**
   * Export GrpcProviders
   */
  providers: ProviderMap = {
    [GrpcBindings.GRPC_SERVER.toString()]: ServerProvider,
    [GrpcBindings.GRPC_GENERATOR]: GeneratorProvider,
  };
  /**
   * Export Grpc Server
   */
  servers: {[name: string]: Constructor<Server>} = {
    GrpcServer,
  };

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) app: Application,
    @inject(GrpcBindings.CONFIG) config: GrpcService,
  ) {
    // Set default configuration for this component
    config = Object.assign(
      {
        host: '127.0.0.1',
        port: 3000,
      },
      config,
    );
    // Bind host, port, proto path, package and sequence
    app.bind(GrpcBindings.HOST).to(config.host);
    app.bind(GrpcBindings.PORT).to(config.port);

    app
      .bind(GrpcBindings.GRPC_SEQUENCE)
      .toClass(config.sequence ?? GrpcSequence);
  }
}
