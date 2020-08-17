// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  BindingScope,
  BindingType,
  ClassBindingSource,
  Context,
  ControllerClass,
  CoreBindings,
  inject,
  MetadataInspector,
  Server,
} from '@loopback/core';
import debugFactory from 'debug';
import grpc from 'grpc';
import {GRPC_METHODS} from './decorators/grpc.decorator';
import {GrpcGenerator} from './grpc.generator';
import {GrpcBindings} from './keys';
import {GrpcMethod, GrpcMethodMetadata, GrpcOperation} from './types';

const debug = debugFactory('loopback:grpc:server');

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * This Class provides a LoopBack Server implementing gRPC
 */
export class GrpcServer extends Context implements Server {
  private _listening = false;
  /**
   * @memberof GrpcServer
   * Creates an instance of GrpcServer.
   *
   * @param app - The application instance (injected via
   * CoreBindings.APPLICATION_INSTANCE).
   * @param server - The actual GRPC Server module (injected via
   * GrpcBindings.GRPC_SERVER).
   * @param options - The configuration options (injected via
   * GRPCBindings.CONFIG).
   *
   */
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) protected app: Application,
    @inject(GrpcBindings.GRPC_SERVER) protected server: grpc.Server,
    @inject(GrpcBindings.HOST) protected host: string,
    @inject(GrpcBindings.PORT) protected port: string,
    @inject(GrpcBindings.GRPC_GENERATOR) protected generator: GrpcGenerator,
  ) {
    super(app);
  }

  private setupControllers() {
    // Execute TypeScript Generator. (Must be first one to load)
    this.generator.execute();
    const bindings = this.find(b => {
      if (b.type !== BindingType.CLASS) return false;
      const ctor = (b.source as ClassBindingSource<unknown>).value;

      const controllerMethods = MetadataInspector.getAllMethodMetadata<
        GrpcMethod
      >(GRPC_METHODS, ctor.prototype);

      return controllerMethods != null;
    });

    debug('Proto bindings', bindings);

    for (const b of bindings) {
      const controllerName = b.key.replace(/^controllers\./, '');
      const ctor = b.valueConstructor;
      if (!ctor) {
        throw new Error(
          `The controller ${controllerName} was not bound via .toClass()`,
        );
      }
      this._setupControllerMethods(ctor);
    }
  }

  public get listening() {
    return this._listening;
  }

  async start(): Promise<void> {
    this.setupControllers();
    this.server.bind(
      `${this.host}:${this.port}`,
      grpc.ServerCredentials.createInsecure(),
    );
    this.server.start();
    this._listening = true;
  }

  async stop(): Promise<void> {
    this.server.forceShutdown();
    this._listening = false;
  }

  private _setupControllerMethods(ctor: ControllerClass) {
    const controllerMethods =
      MetadataInspector.getAllMethodMetadata<GrpcMethodMetadata>(
        GRPC_METHODS,
        ctor.prototype,
      ) ?? {};

    const services = new Map<
      grpc.ServiceDefinition<any>,
      {[method: string]: grpc.handleUnaryCall<grpc.ServerUnaryCall<any>, any>}
    >();

    for (const methodName in controllerMethods) {
      const config = controllerMethods[methodName];
      debug('Config for method %s', methodName, config);

      const meta: GrpcOperation = this.generator.getProto(config.path);
      debug('Proto for %s', config.path, meta);

      if (!meta) {
        throw new Error(`Grpc Server: No proto file was provided.`);
      }

      const serviceDef = meta.service;
      if (!services.has(serviceDef)) {
        services.set(serviceDef, {
          [meta.name]: this.setupGrpcCall(ctor, methodName),
        });
      } else {
        const methods = services.get(serviceDef)!;
        methods[meta.name] = this.setupGrpcCall(ctor, methodName);
      }
    }

    for (const [service, methods] of services.entries()) {
      if (debug.enabled) {
        debug('Adding service:', service, Object.keys(methods));
      }
      this.server.addService(service, methods);
    }
  }
  /**
   * Set up gRPC call
   * @param prototype
   * @param methodName
   */
  private setupGrpcCall<T>(
    ctor: ControllerClass,
    methodName: string,
  ): grpc.handleUnaryCall<grpc.ServerUnaryCall<any>, any> {
    return (
      call: grpc.ServerUnaryCall<any>,
      callback: (err: any, value?: T) => void,
    ) => {
      const handleUnary = async (): Promise<T> => {
        this.bind(GrpcBindings.CONTEXT).to(this);
        this.bind(GrpcBindings.GRPC_CONTROLLER)
          .toClass(ctor)
          .inScope(BindingScope.SINGLETON);
        this.bind(GrpcBindings.GRPC_METHOD_NAME).to(methodName);
        const sequence = await this.get(GrpcBindings.GRPC_SEQUENCE);
        return sequence.unaryCall(call);
      };
      handleUnary().then(
        result => callback(null, result),
        error => {
          callback(error);
        },
      );
    };
  }
}
