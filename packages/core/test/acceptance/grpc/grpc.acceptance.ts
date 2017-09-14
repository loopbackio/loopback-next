// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, service} from '../../..';
import {ValueOrPromise} from '@loopback/context';
import {expect} from '@loopback/testlab';
import * as path from 'path';

// NOTE(bajtos) There is no type definition for grpc yet, see
// https://github.com/grpc/grpc/issues/8233
const grpc = require('grpc');

describe('gRPC', () => {
  describe('Hello Service', () => {
    const helloService = grpc.load(path.join(__dirname, 'hello.proto')).hello;

    // TODO(bajtos) Generate the following three interfaces from hello.proto
    interface HelloRequest {
      name: string;
    }
    interface HelloResponse {
      message: string;
    }
    interface Greeter {
      hello(request: HelloRequest): ValueOrPromise<HelloResponse>;
    }

    it('provides gRPC interface for decorated controllers', async () => {
      @service(helloService.Greeter.service)
      class MyController implements Greeter {
        hello({name}: HelloRequest): HelloResponse {
          return {message: `hello ${name}`};
        }
      }

      const app = new Application({http: {port: 0}});
      app.controller(MyController);
      await app.start();

      const client = createGreeterClient();
      const result = await client.hello({name: 'world'});
      expect(result).to.eql({message: 'hello world'});
    });

    // TODO(bajtos) We want a generic function accepting any grpc client service
    // constructor (e.g. helloService.Greeter) and returning an instance
    // matching our promise/async-await based interface type
    // I think this can be part of the code generator which produces
    // .d.ts typings from .proto files?
    function createGreeterClient(): Greeter {
      const client = new helloService.Greeter(
        // FIXME(bajtos) use an ephemeral port
        'localhost:50051',
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
              response: any,
            ) {
              if (!err) return resolve(response);

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
