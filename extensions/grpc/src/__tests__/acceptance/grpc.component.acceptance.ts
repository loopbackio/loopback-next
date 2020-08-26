// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Client,
  credentials,
  GrpcObject,
  loadPackageDefinition,
  ServerUnaryCall,
} from '@grpc/grpc-js';
import {loadSync} from '@grpc/proto-loader';
import {BootMixin} from '@loopback/boot';
import {Application, ApplicationConfig, Constructor} from '@loopback/core';
import {expect} from '@loopback/testlab';
import path from 'path';
import {
  grpc,
  GrpcBindings,
  GrpcComponent,
  GrpcServer,
  GrpcServerConfig,
} from '../..';
import {GrpcSequenceHandler} from '../../grpc.sequence';
import {GrpcRequestContext} from '../../request-context';
import {
  Greeter,
  HelloReply,
  HelloRequest,
  TestReply,
  TestRequest,
} from '../fixtures/greeter.proto';

describe('GrpcComponent', () => {
  // GRPC Component Configurations
  it('defines grpc component configurations', async () => {
    const app = givenApplication();
    const lbGrpcServer = await app.getServer<GrpcServer>('GrpcServer');
    expect(lbGrpcServer.getSync(GrpcBindings.PORT)).to.be.eql(8080);
  });

  // LoopBack GRPC Service
  it('creates a grpc service', async () => {
    // Define Greeter Service Implementation
    class GreeterController implements Greeter.Service {
      // Tell LoopBack that this is a Service RPC implementation
      @grpc('greeterpackage.Greeter/SayHello')
      sayHello(request: HelloRequest): HelloReply {
        return {
          message: 'Hello ' + request.name,
        };
      }

      @grpc({path: 'greeterpackage.Greeter/SayTest'})
      sayTest(request: TestRequest): TestReply {
        return {
          message: 'Test ' + request.name,
        };
      }
    }
    // Load LoopBack Application
    const app = givenApplication();
    await app.boot();
    app.controller(GreeterController);
    await app.start();
    // Make GRPC Client Call
    const result: HelloReply = await asyncCall({
      client: getGrpcClient(app),
      method: 'sayHello',
      data: {name: 'World'},
    });
    expect(result.message).to.eql('Hello World');
    await app.stop();
  });

  // LoopBack GRPC Service
  it('creates a grpc service with custom sequence', async () => {
    // Define Greeter Service Implementation
    class GreeterController implements Greeter.Service {
      // Tell LoopBack that this is a Service RPC implementation
      @grpc('greeterpackage.Greeter/SayHello')
      sayHello(request: HelloRequest): HelloReply {
        const reply: HelloReply = {message: 'Hello ' + request.name};
        return reply;
      }

      @grpc({path: 'greeterpackage.Greeter/SayTest'})
      sayTest(request: TestRequest): TestReply {
        return {
          message: 'Test ' + request.name,
        };
      }
    }

    class MySequence implements GrpcSequenceHandler {
      async handle<Req = unknown, Res = unknown>(
        reqCtx: GrpcRequestContext<Req, Res>,
      ): Promise<Res> {
        const controller: {[method: string]: Function} = await reqCtx.get(
          GrpcBindings.GRPC_CONTROLLER,
        );
        const method = await reqCtx.get(GrpcBindings.GRPC_METHOD_NAME);
        // Do something before call
        const request = reqCtx.request as ServerUnaryCall<Req, Res>;
        const reply = await controller[method](request.request);
        reply.message += ' Sequenced';
        // Do something after call
        return reply;
      }
    }
    // Load LoopBack Application
    const app = givenApplication(MySequence);
    await app.boot();
    app.controller(GreeterController);
    await app.start();
    // Make GRPC Client Call
    const result: HelloReply = await asyncCall({
      client: getGrpcClient(app),
      method: 'sayHello',
      data: {name: 'World'},
    });
    expect(result.message).to.eql('Hello World Sequenced');
    await app.stop();
  });

  class GRPCApplication extends BootMixin(Application) {
    constructor(config: ApplicationConfig) {
      super(config);
      this.projectRoot = path.join(
        __dirname,
        // Load from src directory as `tsc` won't copy `*.proto` files to `dist`
        '../../../src/__tests__/fixtures',
      );
    }
  }

  /**
   * Returns GRPC Enabled Application
   **/
  function givenApplication(
    sequence?: Constructor<GrpcSequenceHandler>,
  ): GRPCApplication {
    const grpcConfig: GrpcServerConfig = {port: 8080};
    if (sequence) {
      grpcConfig.sequence = sequence;
    }
    const app = new GRPCApplication({
      grpc: grpcConfig,
    });
    app.component(GrpcComponent);
    return app;
  }

  /**
   * Returns GRPC Client
   **/
  function getGrpcClient(app: Application) {
    const protoDef = loadSync(
      path.join(
        __dirname,
        '../../../src/__tests__/fixtures/protos/greeter.proto',
      ),
    );
    const protoObj = loadPackageDefinition(protoDef);
    const proto = protoObj['greeterpackage'] as GrpcObject;
    const client = proto.Greeter as typeof Client;
    return new client(
      `${app.getSync(GrpcBindings.HOST)}:${app.getSync(GrpcBindings.PORT)}`,
      credentials.createInsecure(),
    );
  }

  /**
   * Callback to Promise Wrapper
   **/
  async function asyncCall(input: {
    client: Client;
    method: string;
    data: unknown;
  }): Promise<HelloReply> {
    const client = (input.client as unknown) as Record<string, Function>;
    return new Promise<HelloReply>((resolve, reject) =>
      client[input.method](input.data, (err: unknown, response: HelloReply) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      }),
    );
  }
});
