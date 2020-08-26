// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  handleUnaryCall,
  Server,
  ServerCredentials,
  ServerUnaryCall,
  ServiceDefinition,
  ServiceError,
} from '@grpc/grpc-js';
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
  Server as LoopBackServer,
} from '@loopback/core';
import debugFactory from 'debug';
import {GRPC_METHODS} from './decorators/grpc.decorator';
import {ProtoManager} from './grpc.proto';
import {GrpcBindings} from './keys';
import {GrpcRequestContext} from './request-context';
import {GrpcMethodMetadata, GrpcOperation} from './types';

const debug = debugFactory('loopback:grpc:server');

/**
 * This Class provides a LoopBack Server implementing gRPC
 */
export class GrpcServer extends Context implements LoopBackServer {
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
    @inject(GrpcBindings.GRPC_SERVER) protected server: Server,
    @inject(GrpcBindings.HOST) protected host: string,
    @inject(GrpcBindings.PORT) protected port: string,
    @inject(GrpcBindings.GRPC_PROTO_MANAGER)
    protected protoManager: ProtoManager,
  ) {
    super(app);
  }

  private setupControllers() {
    // Execute TypeScript Generator. (Must be first one to load)
    this.protoManager.indexProtos();
    const bindings = this.find(b => {
      if (b.type !== BindingType.CLASS) return false;
      const ctor = (b.source as ClassBindingSource<unknown>).value;

      const controllerMethods = MetadataInspector.getAllMethodMetadata<
        GrpcMethodMetadata
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
    return new Promise<void>((resolve, reject) => {
      this.server.bindAsync(
        `${this.host}:${this.port}`,
        ServerCredentials.createInsecure(),
        (err, port) => {
          if (err) return reject(err);
          this.server.start();
          this._listening = true;
          resolve();
        },
      );
    });
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
      ServiceDefinition<unknown>,
      {
        [method: string]: handleUnaryCall<
          ServerUnaryCall<unknown, unknown>,
          unknown
        >;
      }
    >();

    for (const methodName in controllerMethods) {
      const config = controllerMethods[methodName];
      debug('Config for method %s', methodName, config);

      const meta = this.protoManager.getProto(config.path);
      debug('Proto for %s', config.path, meta);

      if (!meta) {
        throw new Error(
          `Grpc Server: No protobuf operation found for ${config.path}`,
        );
      }

      const serviceDef = meta.service;
      if (!services.has(serviceDef)) {
        services.set(serviceDef, {
          [meta.name]: this.setupGrpcCall(ctor, methodName, meta),
        });
      } else {
        const methods = services.get(serviceDef)!;
        methods[meta.name] = this.setupGrpcCall(ctor, methodName, meta);
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
  private setupGrpcCall<Req = unknown, Res = unknown>(
    ctor: ControllerClass,
    methodName: string,
    operation: GrpcOperation,
  ): handleUnaryCall<Req, Res> {
    return (
      call: ServerUnaryCall<Req, Res>,
      callback: (err: ServiceError | null, value: Res | null) => void,
    ) => {
      const handleUnary = async (): Promise<Res | void> => {
        const reqCtx = new GrpcRequestContext<Req, Res>(operation, call, this);
        reqCtx.bind(GrpcBindings.CONTEXT).to(this);
        reqCtx
          .bind(GrpcBindings.GRPC_CONTROLLER)
          .toClass(ctor)
          .inScope(BindingScope.SINGLETON);
        reqCtx.bind(GrpcBindings.GRPC_METHOD_NAME).to(methodName);
        const sequence = await this.get(GrpcBindings.GRPC_SEQUENCE);
        return sequence.handle<Req, Res>(reqCtx);
      };
      handleUnary().then(
        result => callback(null, result === undefined ? null : result),
        error => {
          callback(error, null);
        },
      );
    };
  }
}
