// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  service,
  GrpcSequenceHandler,
  ServerUnaryCall,
  UnaryResult,
  ServerWritableStream,
  ServerReadableStream,
  ServerDuplexStream,
  Metadata,
  PlainDataObject,
} from '../../..';
import {expect} from '@loopback/testlab';
import * as path from 'path';
import {Greeter, HelloRequest, HelloResponse} from './hello.proto';

// tslint:disable-next-line:variable-name
const MetadataCtor: new () => Metadata = require('grpc').Metadata;

// NOTE(bajtos) There is no type definition for grpc yet, see
// https://github.com/grpc/grpc/issues/8233
const grpc = require('grpc');

describe('gRPC', () => {
  describe('Hello Service', () => {
    const helloService = grpc.load(path.join(__dirname, 'hello.proto')).hello;

    it('provides gRPC interface for decorated controllers', async () => {
      @service(helloService.Greeter.service)
      class MyController implements Greeter {
        hello({name}: HelloRequest): HelloResponse {
          return {message: `hello ${name}`};
        }
      }

      const app = givenApplication();
      app.controller(MyController);
      await app.start();

      const client = createGreeterClient(app);
      const result = await client.hello({name: 'world'});
      expect(result).to.eql({message: 'hello world'});
    });

    it('supports custom Sequence', async () => {
      @service(helloService.Greeter.service)
      class MyController implements Greeter {
        hello({name}: HelloRequest): HelloResponse {
          return {message: `hello ${name}`};
        }
      }

      class MySequence implements GrpcSequenceHandler {
        async handleUnaryCall(request: ServerUnaryCall): Promise<UnaryResult> {
          return {value: {message: 'good bye'}};
        }

        async handleServerStreaming<Req>(
          request: ServerWritableStream,
        ): Promise<void> {
          throw new Error('Method not implemented.');
        }

        async handleClientStreaming(
          request: ServerReadableStream,
        ): Promise<void> {
          throw new Error('Method not implemented.');
        }

        async handleBiDiStreaming(request: ServerDuplexStream): Promise<void> {
          throw new Error('Method not implemented.');
        }
      }

      const app = givenApplication();
      app.grpcSequence(MySequence);
      app.controller(MyController);
      await app.start();

      const client = createGreeterClient(app);
      const result = await client.hello({name: 'world'});
      expect(result).to.eql({message: 'good bye'});
    });

    function givenApplication() {
      return new Application({
        http: {port: 0},
        grpc: {port: 0},
      });
    }

    // TODO(bajtos) We want a generic function accepting any grpc client service
    // constructor (e.g. helloService.Greeter) and returning an instance
    // matching our promise/async-await based interface type
    // I think this can be part of the code generator which produces
    // .d.ts typings from .proto files?
    function createGreeterClient(app: Application): Greeter {
      const port = app.getSync('grpc.port');
      const client = new helloService.Greeter(
        `localhost:${port}`,
        grpc.credentials.createInsecure(),
      );

      // tslint:disable-next-line:no-any
      const greeter: any = {};

      Object.keys(client.__proto__).forEach(method => {
        // tslint:disable-next-line:no-any
        greeter[method] = function(request: any) {
          return new Promise((resolve, reject) => {
            client[method](request, callbackToPromise);

            function callbackToPromise(
              err: Error & {code?: number},
              // tslint:disable-next-line:no-any
              response: PlainDataObject,
            ) {
              if (!err) {
                // TODO(bajtos) return response metadata too
                resolve(response);
                return;
              }

              // workaround for empty message produced by gRPC client
              if (!err.message && err.code) {
                // TODO(bajtos) replace status codes with descriptive messages
                err.message = `gRPC status ${err.code}`;
              }
              reject(err);
            }
          });
        };
      });

      return greeter as Greeter;
    }
  });
});
